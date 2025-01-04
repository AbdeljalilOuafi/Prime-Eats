import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Redirect if no orders in state
    if (!location.state?.orders) {
      navigate('/cart');
      return;
    }

    const loadPayPalScript = async () => {
      try {
        const script = document.createElement('script');
        // Use environment variable from .env file, fallback to development ID
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons`;
        script.async = true;
        
        script.onload = () => {
          initializePayPalButtons();
        };
        
        document.body.appendChild(script);
        
        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        setError('Failed to load PayPal SDK');
        console.error('PayPal SDK Error:', err);
      }
    };

    loadPayPalScript();
  }, [location.state, navigate]);

  const createPayPalOrder = async () => {
    try {
      const response = await api.post('/payments/create-paypal-order/', {
        orders: location.state.orders
      });

      if (!response.data?.paypal_order_id) {
        throw new Error('Invalid response from server');
      }

      return response.data.paypal_order_id;
    } catch (err) {
      setError('Unable to initialize payment. Please try again later.');
      console.error('Create PayPal Order Error:', err);
      throw err;
    }
  };

  const capturePayment = async (paypalOrderId) => {
    try {
      const response = await api.post('/payments/capture-paypal-order/', {
        paypal_order_id: paypalOrderId,
        orders: location.state.orders
      });

      if (response.data.status === 'success') {
        navigate('/confirmation', {
          state: {
            orders: location.state.orders,
            paymentId: paypalOrderId
          }
        });
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      console.error('Capture Payment Error:', err);
      throw err;
    }
  };

  const initializePayPalButtons = () => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: async () => {
          setLoading(true);
          try {
            return await createPayPalOrder();
          } catch (err) {
            console.error('Error creating order:', err);
            throw err;
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data) => {
          setLoading(true);
          try {
            await capturePayment(data.orderID);
          } catch (err) {
            console.error('Error capturing payment:', err);
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          setError('An error occurred during payment processing. Please try again.');
        },
      }).render('#paypal-button-container');
    }
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {location.state?.orders.map((order, index) => (
          <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
            <p className="font-medium">Order #{order.orderId}</p>
            <p className="text-gray-600">Amount: ${formatPrice(order.totalAmount)}</p>
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span>
              ${formatPrice(location.state?.orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading Message */}
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Processing payment...</p>
        </div>
      )}

      {/* PayPal Button Container */}
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PaymentPage;