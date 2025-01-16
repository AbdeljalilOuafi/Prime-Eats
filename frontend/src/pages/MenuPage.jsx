import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { CartContext } from "../context/CartContext/CartContext";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/ui/toaster";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuantitySelector from "../components/QuantitySelector";

const MenuItem = ({ item, restaurantId, restaurant, onAddToCart }) => {
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { cart } = useContext(CartContext);
  const { toast } = useToast();
  
  const price = typeof item.price === 'string' 
    ? parseFloat(item.price) 
    : item.price;

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const itemWithRestaurant = {
        ...item,
        quantity,
        restaurantId,
        restaurantName: restaurant?.name || 'Unknown Restaurant'
      };

      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(
        cartItem => cartItem.id === item.id && cartItem.restaurantId === restaurantId
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += quantity;
        await onAddToCart(updatedCart[existingItemIndex], true);
      } else {
        // Add new item
        await onAddToCart(itemWithRestaurant);
      }

      toast({
        title: "Added to cart",
        description: `${quantity}x ${item.name} has been added to your cart`,
        duration: 2000,
      });
      
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
      console.error('Error adding item to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="h-full">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={item.image_url || "/placeholder-food.jpg"}
          alt={item.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
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
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">
          {item.description}
        </p>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">
              ${price.toFixed(2)}
            </span>
            <QuantitySelector 
              onQuantityChange={handleQuantityChange}
              initialQuantity={1}
            />
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={item.is_available === false || adding}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black transition-colors"
          >
            {adding ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </div>
            ) : (
              `Add to Cart • $${(price * quantity).toFixed(2)}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image_url: PropTypes.string,
    is_available: PropTypes.bool,
    quantity: PropTypes.number,
    restaurantLocation: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  }).isRequired,
  restaurantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  restaurant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    location: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
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
      <div className="max-w-7xl mx-auto px-4 py-8">
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
        <AnimatePresence>
          {menuCategories.map((category, index) => (
            <motion.section
              key={category.name || index}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuPage;