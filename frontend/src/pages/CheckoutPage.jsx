import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext/CartContext';
import { AddressContext } from '../context/AddressContext/AddressContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CheckoutPage = () => {
  const { cart, deliveryInfo } = useContext(CartContext);
  const { address } = useContext(AddressContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  // Redirect to restaurants if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/restaurants');
    }
  }, [cart, navigate]);

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

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!address.fullAddress) {
        throw new Error('Delivery address is required');
      }

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
            coupon_code: couponCode // Add coupon code to the order payload
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
      console.log('Checkout results:', results);
      
      const orders = results.map(result => ({
        order_id: result.data.order_id,
        totalAmount: result.data.total_amount,
        originalAmount: result.data.original_amount, 
        finalAmount: result.data.final_amount,      
        status: result.data.status,
        isPaid: result.data.is_paid,
        message: result.data.message
      }));

      navigate('/payment', {
        state: {
          orders: orders,
          totalAmount: calculateTotal(cart),
          deliveryAddress: address.fullAddress,
          deliveryLocation: {
            lat: address.latitude,
            lng: address.longitude
          },
          restaurantLocation: deliveryInfo.restaurantLocation,
          couponCode: couponCode // Pass coupon code to payment page
        }
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Delivery Address Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <p className="text-gray-700">
            {address.fullAddress || 'No delivery address set'}
          </p>
        </div>

        {/* Coupon Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Coupon Code</h2>
            {/* Button to Autofill Coupon Code */}
          <button
            onClick={() => setCouponCode("ALX")}
            className="bg-green-600 text-white py-2 px-4 rounded-md mb-4 hover:bg-green-500 transition"
          >
            Use Coupon Code: ALX
          </button>
          <div className="flex gap-4">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
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
              <span>${formatPrice(calculateTotal(cart))}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading || !address.fullAddress}
          className={`w-full bg-yellow-400 text-black py-3 rounded-md font-semibold
            ${(isLoading || !address.fullAddress) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'}`}
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;