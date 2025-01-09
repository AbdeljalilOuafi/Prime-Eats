import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alertAlertTitle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { CartContext } from '../context/CartContext/CartContext';
import api from '../services/api';
import Navbar from './Navbar';

const MenuItem = ({ item, restaurantId, restaurant }) => {
  const [adding, setAdding] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { toast } = useToast();
  const price = typeof item.price === 'string' 
    ? parseFloat(item.price) 
    : item.price;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const itemWithRestaurant = {
        ...item,
        restaurantId,
        restaurantName: restaurant?.name || 'Unknown Restaurant'
      };
      await addToCart(itemWithRestaurant);
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
        duration: 2000,
      });
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
    <Card className="overflow-hidden ">
        <Navbar />
      <div className="aspect-video relative overflow-hidden">
        <img
          src={item.image_url}
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
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">
            ${price.toFixed(2)}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={item.is_available === false || adding}
            className="bg-yellow-400 hover:bg-yellow-500 text-black transition-colors"
          >
            {adding ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Adding...
              </div>
            ) : (
              'Add to Cart'
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
  }).isRequired,
  restaurantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  restaurant: PropTypes.shape({
    name: PropTypes.string,
    image_url: PropTypes.string,
  }),
};

MenuItem.defaultProps = {
  restaurant: null,
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
        // First try to use the state passed from navigation
        if (location.state?.restaurant) {
          setRestaurant(location.state.restaurant);
          setMenu(location.state.restaurant.menu);
          setLoading(false);
          return;
        }

        // If no state, fetch from API
        const response = await api.get(`/restaurants/chain-restaurants/${id}`);
        setRestaurant(response.data);
        setMenu(response.data.menu);
        setLoading(false);
      } catch (err) {
        setError('Failed to load menu. Please try again later.');
        setLoading(false);
        console.error('Error fetching menu:', err);
      }
    };

    fetchMenu();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        <p className="mt-4 text-gray-600">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto p-4 pt-28"
    >
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Restaurant Header */}
      <div className="mb-8 pt-4">
        <div className="relative h-64 rounded-xl overflow-hidden mb-6">
          <img
            src={restaurant?.image_url}
            alt={restaurant?.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-restaurant.jpg";
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h1 className="text-4xl font-bold text-white">
              {restaurant?.name}
            </h1>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AnimatePresence mode="wait">
          {menu?.categories?.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AccordionItem value={`category-${category.id}`}>
                <AccordionTrigger className="text-lg font-semibold">
                  {category.name}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        restaurantId={id}
                        restaurant={restaurant}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </Accordion>
    </motion.div>
  );
};

// PropTypes for the menu data structure
ChainMenu.propTypes = {
  // While ChainMenu doesn't directly receive props, defining these helps document
  // the expected structure of the API response and location state
  location: PropTypes.shape({
    state: PropTypes.shape({
      restaurant: PropTypes.shape({
        name: PropTypes.string.isRequired,
        image_url: PropTypes.string,
        menu: PropTypes.shape({
          categories: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            items: PropTypes.arrayOf(PropTypes.shape({
              id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
              name: PropTypes.string.isRequired,
              description: PropTypes.string,
              price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
              image_url: PropTypes.string,
              is_available: PropTypes.bool,
            })).isRequired,
          })).isRequired,
        }).isRequired,
      }),
    }),
  }),
};

export default ChainMenu;