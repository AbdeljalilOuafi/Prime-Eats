import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alertAlertTitle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { CartContext } from '../context/CartContext/CartContext';
import api from '../services/api';
import Navbar from './Navbar';
import QuantitySelector from './QuantitySelector';

const MenuItem = ({ item, restaurantId, restaurant }) => {
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { cart, addToCart } = useContext(CartContext);
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
        restaurantName: restaurant?.name || 'Unknown Restaurant',
        restaurantLocation: restaurant?.location
      };

      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(
        cartItem => cartItem.id === item.id && cartItem.restaurantId === restaurantId
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += quantity;
        await addToCart(updatedCart[existingItemIndex], true);
      } else {
        // Add new item
        await addToCart(itemWithRestaurant);
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



  

const ChainMenu = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (location.state?.restaurant) {
          setRestaurant(location.state.restaurant);
          setMenu(location.state.restaurant.menu);
          setLoading(false);
          return;
        }

        const response = await api.get(`/restaurants/chain-restaurants/${id}`);
        setRestaurant(response.data);
        setMenu(response.data.menu);
        setLoading(false);
      } catch {
        setError('Failed to load menu. Please try again later.');
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id, location.state]);

  // Animation variants matching RestaurantsPage
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.50
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto mt-6 px-6 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-12 px-6 py-12">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{restaurant?.name}</h2>
          <div className="relative h-64 rounded-xl overflow-hidden">
            <img
              src={restaurant?.image_url}
              alt={restaurant?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-restaurant.jpg";
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {menu?.categories?.map((category) => (
            <motion.section
              key={category.id}
              className="mb-12"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <h3 className="text-2xl font-semibold text-gray-700 mb-6">{category.name}</h3>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
              >
                {category.items.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="h-full"
                  >
                    <MenuItem
                      item={item}
                      restaurantId={id}
                      restaurant={restaurant}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </div>
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

export default ChainMenu;