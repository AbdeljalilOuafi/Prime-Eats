import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext/CartContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CheckoutPage = () => {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to cart if cart is empty
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

  // Helper function to group cart items by restaurant
  const groupByRestaurant = () => {
    return cart.reduce((grouped, item) => {
      const restaurantId = item.restaurantId;
      if (!grouped[restaurantId]) {
        grouped[restaurantId] = {
          restaurantName: item.restaurantName || 'Unknown Restaurant',
          items: []
        };
      }
      grouped[restaurantId].items.push(item);
      return grouped;
    }, {});
  };

  const formatOrderItems = () => {
    const itemsByRestaurant = cart.reduce((acc, item) => {
      const restaurantId = item.restaurantId;
      if (!acc[restaurantId]) {
        acc[restaurantId] = [];
      }
      
      const existingItem = acc[restaurantId].find(i => i.item_id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        acc[restaurantId].push({
          item_id: item.id,
          quantity: 1,
          price: item.price
        });
      }
      
      return acc;
    }, {});

    return itemsByRestaurant;
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const formattedOrders = formatOrderItems();
      const orderPromises = Object.entries(formattedOrders).map(([restaurantId, items]) => {
        return api.post('/orders/create/', {
          restaurant_id: parseInt(restaurantId),
          items: items,
          total_amount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
      });

      const results = await Promise.all(orderPromises);
      
      const orders = results.map(result => ({
        orderId: result.data.order_id,
        totalAmount: result.data.total_amount,
        status: result.data.status,
        restaurantId: result.data.restaurant_id
      }));

      // Navigate to payment page with order information
      navigate('/payment', {
        state: {
          orders,
          totalAmount: calculateTotal(cart)
        }
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to process checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const restaurantGroups = groupByRestaurant();

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {Object.entries(restaurantGroups).map(([restaurantId, group]) => (
            <div key={restaurantId} className="mb-6 last:mb-0">
              <h3 className="font-medium text-lg mb-3 text-gray-800">
                {group.restaurantName}
              </h3>
              
              <div className="space-y-3">
                {group.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">${formatPrice(item.price)}</p>
                    </div>
                    <p className="text-gray-600">Quantity: 1</p>
                  </div>
                ))}
              </div>
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
          disabled={isLoading}
          className={`w-full bg-yellow-400 text-black py-3 rounded-md font-semibold
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'}`}
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;