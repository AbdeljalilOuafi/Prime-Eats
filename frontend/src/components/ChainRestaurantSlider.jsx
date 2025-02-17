import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from '../services/api';
import Autoplay from 'embla-carousel-autoplay';

const ChainRestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleViewMenu = () => {
    navigate(`/chain-menu/${restaurant.id}`, {
      state: { restaurant }
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="h-full pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="h-full bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.src = "/placeholder-restaurant.jpg";
              }}
            />
          </div>
          <div className="p-4 flex flex-col flex-grow bg-white/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {restaurant.name}
            </h3>
            <div className="mt-auto">
              <Button 
                onClick={handleViewMenu}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black transition-colors"
              >
                View Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

ChainRestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
  }).isRequired,
};

const ChainRestaurantSlider = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoplayPlugin] = useState(() => 
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants/chain-restaurants/');
        setRestaurants(response.data);
      } catch (err) {
        setError('Failed to load restaurants');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 pointer-events-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500 bg-white/50 backdrop-blur-sm pointer-events-auto">
        {error}
      </div>
    );
  }

  return (
    <section className="py-16 px-4 pointer-events-none">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 pointer-events-auto bg-white/50 backdrop-blur-sm inline-block px-4 py-2 rounded-lg mx-auto">
          Popular Restaurants
        </h2>
        <Carousel
          plugins={[autoplayPlugin]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            slidesToScroll: 1
          }}
        >
          <CarouselContent className="-ml-4">
            <AnimatePresence>
              {restaurants.map((restaurant) => (
                <CarouselItem 
                  key={restaurant.id} 
                  className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/5"
                >
                  <ChainRestaurantCard restaurant={restaurant} />
                </CarouselItem>
              ))}
            </AnimatePresence>
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default ChainRestaurantSlider;