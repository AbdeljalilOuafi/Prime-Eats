import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PropTypes from 'prop-types';
import { CartContext } from '../context/CartContext/CartContext';

const OrderSummary = ({ orders, orderDetails, formatPrice }) => {
  if (!orders?.length) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map((order, index) => (
          <div key={index} className="mb-4 pb-4 border-b">
            <p className="font-medium">Order #{order.order_id}</p>
          </div>
        ))}

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span>Original Amount:</span>
            <span>
              ${formatPrice(
                orderDetails?.originalAmount ||
                  orders.reduce((sum, order) => sum + order.originalAmount, 0)
              )}
            </span>
          </div>

          {orderDetails?.couponApplied && (
            <div className="flex justify-between text-green-600">
              <span>Discount Applied:</span>
              <span>
                -${formatPrice(orderDetails.originalAmount - orderDetails.finalAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold">
            <span>Final Amount:</span>
            <span>
              ${formatPrice(
                orderDetails?.finalAmount ||
                  orders.reduce((sum, order) => sum + order.finalAmount, 0)
              )}
            </span>
          </div>
        </div>

        {orderDetails?.message && (
          <Alert className="mt-4">{orderDetails.message}</Alert>
        )}
      </CardContent>
    </Card>
  );
};

OrderSummary.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      order_id: PropTypes.string.isRequired,
      totalAmount: PropTypes.number.isRequired,
    })
  ).isRequired,
  orderDetails: PropTypes.shape({
    originalAmount: PropTypes.number,
    finalAmount: PropTypes.number,
    couponApplied: PropTypes.bool,
    message: PropTypes.string,
  }),
  formatPrice: PropTypes.func.isRequired,
};

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(CartContext);

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
  };

  const loadPayPalScript = async () => {
    try {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }

      const clientId = "Af1Zf3lwK5SBiFtDTiN5H5WOqekN5qjIVYFqQFRdepCT3gPKa3cz_Hgp5ggiqIuLvOr2lGQ46aZl5vTg";
      
      if (!clientId) {
        throw new Error('PayPal client ID is not configured');
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        setScriptLoaded(true);
        setSdkReady(true);
      };

      script.onerror = (err) => {
        console.error('Error loading PayPal script:', err);
        setError('Failed to load PayPal SDK');
      };
      
      document.body.appendChild(script);
    } catch (err) {
      console.error('PayPal SDK Error:', err);
      setError(err.message || 'Failed to load PayPal SDK');
    }
  };

  useEffect(() => {
    if (!location.state?.orders) {
      navigate('/cart');
      return;
    }

    loadPayPalScript();

    return () => {
      const scriptElement = document.querySelector('script[src*="paypal.com/sdk"]');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, [location.state, navigate]);

  const handleSuccessfulPayment = (orderId) => {
    // Clear the cart using context
    clearCart();
    
    // Navigate to order tracking
    navigate('/order-tracking', {
      state: {
        orderId: orderId,
        restaurantLocation: {
          lat: location.state.restaurantLocation?.lat ? Number(location.state.restaurantLocation.lat) : null,
          lng: location.state.restaurantLocation?.lng ? Number(location.state.restaurantLocation.lng) : null
        },
        deliveryLocation: {
          lat: location.state.deliveryLocation?.lat ? Number(location.state.deliveryLocation.lat) : null,
          lng: location.state.deliveryLocation?.lng ? Number(location.state.deliveryLocation.lng) : null
        },
        deliveryAddress: location.state.deliveryAddress
      }
    });
  };

  useEffect(() => {
    if (sdkReady && scriptLoaded) {
      const initializePayPalButton = async () => {
        try {
          const container = document.getElementById('paypal-button-container');
          if (!container) return;

          container.innerHTML = '';

          if (window.paypal) {
            await window.paypal.Buttons({
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 45 // Set a consistent height
              },
              createOrder: async () => {
                try {
                  const orderId = await createPayPalOrder();
                  if (!orderId) {
                    throw new Error('Failed to create PayPal order ID');
                  }
                  return orderId;
                } catch (err) {
                  console.error('Error creating order:', err);
                  setError(err.message || 'Failed to create PayPal order');
                  throw err;
                }
              },
              onApprove: async (data) => {
                try {
                  await capturePayment(data.orderID);
                } catch (err) {
                  console.error('Error capturing payment:', err);
                  setError(err.message || 'Failed to capture payment');
                }
              },
              onError: (err) => {
                console.error('PayPal error:', err);
                setError('Payment processing error. Please try again.');
              },
              onCancel: () => {
                console.log('Payment cancelled by user');
                setError('Payment was cancelled. Please try again.');
              }
            }).render('#paypal-button-container');
          }
        } catch (err) {
          console.error('Error initializing PayPal buttons:', err);
          setError('Failed to initialize payment options');
        }
      };

      initializePayPalButton();
    }
  }, [sdkReady, scriptLoaded]);

  const createPayPalOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!location.state?.orders || !location.state.orders.length) {
        throw new Error('No order information available');
      }
  
      const firstOrder = location.state.orders[0];
      
      const orderData = {
        order_id: firstOrder.order_id,
        amount: location.state.totalAmount,
        coupon_code: location.state?.couponCode || null
      };
  
      const response = await api.post('/payments/create-paypal-order/', orderData);
  
      if (!response.data.paypal_order_id) {
        throw new Error('Invalid response: Missing PayPal order ID');
      }
  
      setOrderDetails({
        orderId: response.data.paypal_order_id,
        originalAmount: response.data.original_amount || location.state.totalAmount,
        finalAmount: response.data.final_amount || location.state.totalAmount,
        status: response.data.status || 'pending',
        isPaid: response.data.is_paid || false,
        couponApplied: response.data.coupon_applied || false,
        message: response.data.message || ''
      });
  
      return response.data.paypal_order_id;
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Unable to initialize payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const capturePayment = async (paypalOrderId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!paypalOrderId) {
        throw new Error('PayPal order ID is required for capture');
      }
  
      const originalOrderId = location.state?.orders[0]?.order_id;
      if (!originalOrderId) {
        throw new Error('Order not found');
      }
  
      const captureData = {
        paypal_order_id: paypalOrderId,
        order_id: originalOrderId,
        amount: orderDetails?.finalAmount || location.state.totalAmount,
        coupon_code: location.state?.couponCode || null
      };
  
      const response = await api.post('/payments/capture-paypal-order/', captureData);
  
      if (response.data.status === 'success') {
        handleSuccessfulPayment(originalOrderId);
      } else {
        throw new Error(response.data.message || 'Payment capture failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Payment processing failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!location.state?.orders || !location.state.orders.length) {
        throw new Error('No order information available');
      }

      const originalOrderId = location.state.orders[0].order_id;
      const finalAmount = orderDetails?.finalAmount || location.state.totalAmount;

      // Simulate a successful payment response
      const mockPaymentResponse = {
        status: 'success',
        paypal_order_id: `TEST_${Date.now()}`,
        original_amount: finalAmount,
        final_amount: finalAmount,
        is_paid: true,
        message: 'Test payment successful'
      };

      setOrderDetails({
        orderId: mockPaymentResponse.paypal_order_id,
        originalAmount: mockPaymentResponse.original_amount,
        finalAmount: mockPaymentResponse.final_amount,
        status: mockPaymentResponse.status,
        isPaid: mockPaymentResponse.is_paid,
        message: mockPaymentResponse.message
      });

      handleSuccessfulPayment(originalOrderId);

    } catch (err) {
      console.error('Test Payment Error:', err);
      setError(err.message || 'Test payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Main content with lower z-index */}
      <div className="relative z-0 max-w-2xl mx-auto px-4 py-8 mt-32">
        <h1 className="text-3xl font-bold mb-6">Payment</h1>
      
        <OrderSummary 
          orders={location.state?.orders}
          orderDetails={orderDetails}
          formatPrice={formatPrice}
        />

        {error && (
          <Alert variant="destructive" className="mb-4">
            <div className="font-medium">Error</div>
            <div>{error}</div>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-6 h-6 animate-spin mr-2" />
                <span className="text-gray-600">Processing payment...</span>
              </div>
            )}

            {!sdkReady && !loading && (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-6 h-6 animate-spin mr-2" />
                <span className="text-gray-600">Loading payment options...</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex justify-center">
                {/* PayPal container with explicit z-index */}
                <div 
                  id="paypal-button-container" 
                  className="w-full max-w-md relative z-0"
                  style={{ zIndex: 0 }}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleTestPayment}
                  disabled={loading}
                  className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Test Payment (Simulated)'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;