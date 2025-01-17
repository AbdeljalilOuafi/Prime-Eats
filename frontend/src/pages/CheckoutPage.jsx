import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext/CartContext';
import { AddressContext } from '../context/AddressContext/AddressContext';
import { useUser } from "@clerk/clerk-react";
import { AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import AddressInput from '../components/AddressInput';

const CheckoutPage = () => {
  const { cart, deliveryInfo } = useContext(CartContext);
  const { address } = useContext(AddressContext);
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [validationStatus, setValidationStatus] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Check authentication and cart status
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        sessionStorage.setItem("pendingCheckout", "true");
        navigate('/sign-in');
        return;
      }
      
      if (cart.length === 0) {
        navigate('/restaurants');
        return;
      }
    }
  }, [cart, isSignedIn, isLoaded, navigate]);

  // Helper function to safely format price
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : "0.00";
  };

  // Helper function to safely calculate total
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const itemPrice = Number(item.price);
      return sum + (!isNaN(itemPrice) ? itemPrice : 0);
    }, 0);
  };

  const validateCouponCode = (code) => {
    // Basic input validation
    if (!code || code.trim().length === 0) {
      setValidationStatus('error');
      setValidationMessage('Please enter a coupon code');
      return;
    }

    // Check for unsupported characters (only allow alphanumeric and hyphen)
    if (!/^[A-Za-z0-9-]+$/.test(code)) {
      setValidationStatus('error');
      setValidationMessage('Coupon code contains invalid characters');
      return;
    }

    // Simulate validation with setTimeout
    setIsValidating(true);
    setValidationStatus(null);
    setValidationMessage('');

    setTimeout(() => {
      const trimmedCode = code.trim().toUpperCase();
      
      if (trimmedCode === 'ALX') {
        setValidationStatus('success');
        setValidationMessage('Special discount applied - Total price: $0.01!');
      } else {
        setValidationStatus('error');
        setValidationMessage('Invalid coupon code');
      }
      
      setIsValidating(false);
    }, 500);
  };

  const handleCheckout = async () => {
    if (!isSignedIn) {
      setError('Please sign in to continue with checkout');
      return;
    }

    if (!address.fullAddress) {
      setError('Please provide a delivery address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setOrderProcessing(true);

      const formattedOrders = cart.reduce((acc, item) => {
        if (!item.restaurantId) {
          console.error('Missing restaurantId for item:', item);
          return acc;
        }

        const restaurantId = parseInt(item.restaurantId);
        
        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurant_id: restaurantId,
            items: [],
            delivery_address: address.fullAddress,
            delivery_latitude: address.latitude,
            delivery_longitude: address.longitude,
            coupon_code: validationStatus === 'success' ? couponCode.trim() : null
          };
        }
        
        if (!item.id) {
          console.error('Missing item.id for item:', item);
          return acc;
        }

        acc[restaurantId].items.push({
          item_id: parseInt(item.id),
          quantity: 1
        });
        
        return acc;
      }, {});

      const orderPayloads = Object.values(formattedOrders);

      if (orderPayloads.length === 0) {
        throw new Error('No valid orders to process');
      }

      const orderPromises = orderPayloads.map(async orderPayload => {
        try {
          const response = await api.post('/orders/create/', orderPayload);
          return response;
        } catch (error) {
          console.error('Error for restaurant', orderPayload.restaurant_id, ':', error.response?.data);
          throw error;
        }
      });

      const results = await Promise.all(orderPromises);
      
      const orders = results.map(result => ({
        order_id: result.data.order_id,
        totalAmount: validationStatus === 'success' ? 0.01 : result.data.total_amount,
        originalAmount: result.data.original_amount,
        finalAmount: validationStatus === 'success' ? 0.01 : result.data.final_amount,
        status: result.data.status,
        isPaid: result.data.is_paid,
        message: result.data.message
      }));

      navigate('/payment', {
        state: {
          orders: orders,
          totalAmount: validationStatus === 'success' ? 0.01 : calculateTotal(cart),
          deliveryAddress: address.fullAddress,
          deliveryLocation: {
            lat: address.latitude,
            lng: address.longitude
          },
          restaurantLocation: deliveryInfo.restaurantLocation,
          couponCode: validationStatus === 'success' ? couponCode.trim() : null
        }
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to process checkout. Please try again.');
      setOrderProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCoupon = () => {
    setCouponCode('');
    setValidationStatus(null);
    setValidationMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Delivery Address Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          {!address.fullAddress ? (
            <div>
              <div className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Please set a delivery address to continue</span>
              </div>
              <AddressInput />
            </div>
          ) : (
            <p className="text-gray-700">{address.fullAddress}</p>
          )}
        </div>

        {/* Coupon Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Have a Coupon?</h2>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isValidating || validationStatus === 'success'}
                placeholder="Enter coupon code"
                className={`w-full p-2 pr-24 border rounded-md focus:outline-none focus:ring-2 
                  ${validationStatus === 'success' ? 'border-green-500 focus:ring-green-200' : 
                    validationStatus === 'error' ? 'border-red-500 focus:ring-red-200' : 
                    'border-gray-300 focus:ring-yellow-200'}
                `}
                maxLength={15}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isValidating ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : validationStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : validationStatus === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : null}
                
                {(validationStatus === 'success' || couponCode) && (
                  <button
                    onClick={handleClearCoupon}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {validationMessage && (
              <div
                className={`text-sm flex items-center gap-2 
                  ${validationStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}
              >
                {validationStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{validationMessage}</span>
              </div>
            )}

            {couponCode && validationStatus !== 'success' && (
              <button
                onClick={() => validateCouponCode(couponCode)}
                disabled={isValidating}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium
                  ${isValidating ? 
                    'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                    'bg-yellow-400 text-black hover:bg-yellow-500 transition-colors'}`}
              >
                {isValidating ? 'Validating...' : 'Apply Coupon'}
              </button>
            )}

            {/* Sample Coupons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCouponCode("ALX")}
                className="bg-gray-100 hover:bg-gray-200 text-sm py-1 px-3 rounded-full transition"
              >
                Try: ALX
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">${formatPrice(item.price)}</p>
              </div>
              <p className="text-gray-600">Quantity: 1</p>
            </div>
          ))}
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>${validationStatus === 'success' ? '0.01' : formatPrice(calculateTotal(cart))}</span>
            </div>
          </div>
        </div>

        {/* Proceed to Payment Button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading || !address.fullAddress || !isSignedIn || orderProcessing}
          className={`w-full bg-yellow-400 text-black py-3 rounded-md font-semibold
            ${(isLoading || !address.fullAddress || !isSignedIn || orderProcessing) 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-yellow-500 transition-colors'}`}
        >
          {isLoading ? 'Processing...' : orderProcessing ? 'Creating Order...' : 'Proceed to Payment'}
        </button>

        {/* Back to Shopping Button */}
        {/* <button
          onClick={() => navigate('/restaurants')}
          className="w-full mt-4 bg-transparent border border-yellow-400 text-yellow-600 py-3 rounded-md font-semibold
            hover:bg-yellow-50 transition-colors"
        >
          Continue Shopping
        </button> */}
      </div>
    </div>
  );
};

export default CheckoutPage;