import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui/alertAlertTitle';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import PropTypes from 'prop-types';

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
            {/* <p className="text-gray-600">Amount: ${formatPrice(order.totalAmount)}</p>
            <p className="text-gray-600">Original Amount: ${formatPrice(order.originalAmount)}</p>
            <p className="text-gray-600">Final Amount: ${formatPrice(order.finalAmount)}</p> */}
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
              <span>Discount Applied (Code: ALX):</span>
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

      const clientId = "AartfsAJihC78lPm8_kFqloOD0PwsFiiHQL2YmCYwMOAgaKc268HkeQiX8DyGQOGEalVATpZwBUSLWex";
      
      if (!clientId) {
        throw new Error('PayPal client ID is not configured');
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal script loaded successfully');
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

  useEffect(() => {
    if (sdkReady && scriptLoaded) {
      const initializePayPalButton = async () => {
        try {
          const container = document.getElementById('paypal-button-container');
          if (!container) {
            console.error('PayPal button container not found');
            return;
          }

          container.innerHTML = '';

          if (window.paypal) {
            console.log('Rendering PayPal buttons...');
            await window.paypal.Buttons({
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal'
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
            console.log('PayPal buttons rendered successfully');
          } else {
            console.error('PayPal SDK not loaded properly');
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
  
      console.log('Creating PayPal order with data:', orderData);
  
      const response = await api.post('/payments/create-paypal-order/', orderData);
      console.log('PayPal create order response:', response.data);
  
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
  
      console.log('Capturing PayPal payment:', captureData);
  
      const response = await api.post('/payments/capture-paypal-order/', captureData);
      console.log('PayPal capture response:', response.data);
  
      if (response.data.status === 'success') {
        navigate('/order-tracking', {
          state: {
            orderId: originalOrderId,
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
      } else {
        throw new Error(response.data.message || 'Payment capture failed');
      }
    } catch (err) {
      console.error('Capture Payment Error:', err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-32">
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

            <div id="paypal-button-container" className="min-h-[150px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;