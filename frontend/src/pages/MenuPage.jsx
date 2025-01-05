import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CartContext } from "../context/CartContext/CartContext";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const MenuItem = ({ item, restaurantId, restaurant, onAddToCart }) => {
  const price = typeof item.price === 'string' 
    ? parseFloat(item.price) 
    : item.price;

  const handleAddToCart = () => {
    // Add restaurant info to the item before adding to cart
    const itemWithRestaurant = {
      ...item,
      restaurantId: restaurantId,
      restaurantName: restaurant?.name || 'Unknown Restaurant'
    };
    onAddToCart(itemWithRestaurant);
  };

  return (
    <motion.div 
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48">
        <img
          src={item.image_url || "/placeholder-food.jpg"}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/placeholder-food.jpg";
          }}
        />
        {item.is_available === false && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-semibold">Currently Unavailable</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 min-h-[3rem]">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg
              hover:bg-yellow-500 transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={item.is_available === false}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image_url: PropTypes.string,
    is_available: PropTypes.bool
  }).isRequired,
  restaurantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  restaurant: PropTypes.object.isRequired,
  onAddToCart: PropTypes.func.isRequired
};

const MenuPage = () => {
  const location = useLocation();
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { restaurant, isChain } = location.state || {};
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchRestaurantIfNeeded = async () => {
      if (!restaurant) {
        setLoading(true);
        try {
          // First try to get from location state
          if (location.state?.restaurant) {
            return;
          }

          // If no state, fetch from API
          const response = await fetch(`/api/restaurants/${restaurantId}`);
          if (!response.ok) {
            throw new Error('Restaurant not found');
          }
          const data = await response.json();
          
          navigate(`/menu/${restaurantId}`, {
            state: { 
              restaurant: data,
              isChain: data.type === 'chain' 
            },
            replace: true
          });
        } catch (error) {
          console.error('Error fetching restaurant:', error);
          setError('Restaurant not found or unavailable');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRestaurantIfNeeded();
  }, [restaurant, restaurantId, navigate, location.state]);

  const menuCategories = useMemo(() => {
    if (!restaurant) return [];
    
    if (isChain) {
      return Object.entries(restaurant.menu)
        .filter(([key]) => key !== 'image_url')
        .map(([name, items]) => ({ name, items }));
    }
    
    return restaurant.menu?.categories || [];
  }, [restaurant, isChain]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-xl text-gray-600">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] space-y-4">
          <p className="text-xl text-gray-600">{error || 'Restaurant not found'}</p>
          <button
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            onClick={() => navigate('/restaurants')}
          >
            Return to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-32">
        {/* Restaurant Header */}
        <div className="mb-8">
          <div className="relative h-64 rounded-xl overflow-hidden mb-6">
            <img
              src={isChain ? restaurant.menu?.image_url : restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-restaurant.jpg";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h1 className="text-4xl font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <p className="text-white text-opacity-90">
                {isChain 
                  ? "Chain Restaurant - Multiple Locations" 
                  : (restaurant.address || "Address not available")}
              </p>
            </div>
          </div>
          
          {!isChain && restaurant.rating && (
            <div className="flex items-center mb-4">
              <span className="text-yellow-400 mr-1">⭐</span>
              <span className="text-gray-600">{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Menu Categories */}
        {menuCategories.map((category, index) => (
          <motion.section
            key={category.name || index}
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item) => (
                <MenuItem 
                  key={item.id || item.name} 
                  item={item}
                  restaurantId={restaurantId}
                  restaurant={restaurant}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;