import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
  };

  const createPayPalOrder = async () => {
    try {
      setLoading(true);
      
      if (!location.state?.orders || !location.state.orders.length) {
        throw new Error('No order information available');
      }

      const firstOrder = location.state.orders[0];
      
      const orderData = {
        order_id: firstOrder.order_id,
        amount: firstOrder.totalAmount
      };
  
      console.log('Creating PayPal order with data:', orderData);
  
      const response = await api.post('/payments/create-paypal-order/', orderData);
      console.log('PayPal create order response:', response.data);
  
      if (!response.data?.paypal_order_id) {
        throw new Error('Invalid response from server');
      }
  
      return response.data.paypal_order_id;
      
    } catch (err) {
      console.error('Create PayPal Order Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Unable to initialize payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const capturePayment = async (paypalOrderId) => {
    try {
      setLoading(true);
      
      const firstOrder = location.state.orders[0];
      const deliveryAddress = location.state.deliveryAddress; // We'll pass this from the cart/checkout
      
      const captureData = {
        paypal_order_id: paypalOrderId,
        order_id: firstOrder.order_id,
        amount: firstOrder.totalAmount
      };
  
      console.log('Capturing PayPal payment:', captureData);
  
      const response = await api.post('/payments/capture-paypal-order/', captureData);
      console.log('PayPal capture response:', response.data);
  
      if (response.data.status === 'success') {
        // Redirect to tracking page instead of confirmation
        navigate('/order-tracking', {
          state: {
            orderId: firstOrder.order_id,
            restaurantLocation: {
              lat: location.state.restaurantLocation?.lat ? Number(location.state.restaurantLocation.lat) : null,
              lng: location.state.restaurantLocation?.lng ? Number(location.state.restaurantLocation.lng) : null
            },
            deliveryLocation: {
              lat: location.state.deliveryLocation?.lat ? Number(location.state.deliveryLocation.lat) : null,
              lng: location.state.deliveryLocation?.lng ? Number(location.state.deliveryLocation.lng) : null
            },
            deliveryAddress: deliveryAddress
          }
        });
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Capture Payment Error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Payment processing failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const initializePayPalButtons = () => {
    // Make sure the container exists before initializing
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error('PayPal button container not found');
      return;
    }

    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            return await createPayPalOrder();
          } catch (err) {
            console.error('Error creating order:', err);
            throw err;
          }
        },
        onApprove: async (data) => {
          try {
            await capturePayment(data.orderID);
          } catch (err) {
            console.error('Error capturing payment:', err);
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          setError('Payment processing error. Please try again.');
        },
      }).render('#paypal-button-container');
    }
  };
  
  useEffect(() => {
    if (!location.state?.orders) {
      navigate('/cart');
      return;
    }

    const loadPayPalScript = async () => {
      try {
        if (document.querySelector('script[src*="paypal.com/sdk"]')) {
          setSdkReady(true);
          setTimeout(initializePayPalButtons, 0); // Ensure DOM is ready
          return;
        }

        const clientId = "AartfsAJihC78lPm8_kFqloOD0PwsFiiHQL2YmCYwMOAgaKc268HkeQiX8DyGQOGEalVATpZwBUSLWex";
        
        if (!clientId) {
          throw new Error('PayPal client ID is not configured');
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons`;
        script.async = true;
        
        script.onload = () => {
          setSdkReady(true);
          setTimeout(initializePayPalButtons, 0); // Ensure DOM is ready
        };

        script.onerror = () => {
          throw new Error('Failed to load PayPal SDK');
        };
        
        document.body.appendChild(script);
        
        return () => {
          const scriptElement = document.querySelector('script[src*="paypal.com/sdk"]');
          if (scriptElement) {
            document.body.removeChild(scriptElement);
          }
        };
      } catch (err) {
        setError(err.message || 'Failed to load PayPal SDK');
        console.error('PayPal SDK Error:', err);
      }
    };

    loadPayPalScript();
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-32">
        <h1 className="text-3xl font-bold mb-6">Payment</h1>
      
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {location.state?.orders?.map((order, index) => (
            <div key={index} className="mb-4 pb-4 border-b">
              <p className="font-medium">Order #{order.order_id}</p>
              <p className="text-gray-600">Amount: ${formatPrice(order.totalAmount)}</p>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>${formatPrice(location.state?.totalAmount)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Processing payment...</p>
          </div>
        )}

        {/* PayPal Button Container with explicit styling */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {sdkReady && !error && (
            <div id="paypal-button-container" className="min-h-[150px] w-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;