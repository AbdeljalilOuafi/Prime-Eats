import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import TiltRestaurantCard from "../components/TiltRestaurantCard";
import api from "../services/api"; // Make sure this import exists
import { useContext } from "react";
import { AddressContext } from "../context/AddressContext/AddressContext";
import Loader from "../components/Loader"; // Make sure this component exists

const RestaurantsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = useContext(AddressContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantData, setRestaurantData] = useState({
    restaurants: [],
    chain_restaurants: []
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      // If we have state data, use it
      if (location.state?.data?.restaurants || location.state?.data?.chain_restaurants) {
        setRestaurantData(location.state.data);
        setIsLoading(false);
        return;
      }

      // If we have address coordinates, fetch new data
      if (address.latitude && address.longitude) {
        try {
          const response = await api.get(
            `/restaurants/?latitude=${address.latitude}&longitude=${address.longitude}&radius=1000`
          );
          setRestaurantData(response.data);
        } catch (err) {
          setError("Failed to fetch restaurants. Please try again.");
          console.error("Error fetching restaurants:", err);
        }
      } else {
        // No address or state data, redirect to home
        navigate("/");
      }
      setIsLoading(false);
    };

    fetchRestaurants();
  }, [location.state, address, navigate]);

  const handleRestaurantClick = (restaurant, isChain = false) => {
    const restaurantId = isChain ? restaurant.name : restaurant.id;
    navigate(`/menu/${restaurantId}`, { 
      state: { 
        restaurant,
        isChain 
      } 
    });
  };

  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto mt-6 px-6 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const { restaurants, chain_restaurants } = restaurantData;

  if (!restaurants?.length && !chain_restaurants?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto mt-6 px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Restaurants Available</h2>
            <p className="text-gray-600">Sorry, we couldn&apos;t find any restaurants in your area.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-md font-semibold hover:bg-yellow-500"
            >
              Change Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-6 px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Available Restaurants</h2>
        
        {restaurants?.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Local Restaurants</h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {restaurants.map((restaurant) => (
                <motion.div
                  key={restaurant.id}
                  variants={itemVariants}
                  onClick={() => handleRestaurantClick(restaurant, false)}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                >
                  <TiltRestaurantCard 
                    restaurant={restaurant}
                    isChain={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {chain_restaurants?.length > 0 && (
          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Chain Restaurants</h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {chain_restaurants.map((chain) => (
                <motion.div
                  key={chain.name}
                  variants={itemVariants}
                  onClick={() => handleRestaurantClick(chain, true)}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                >
                  <TiltRestaurantCard 
                    restaurant={chain}
                    isChain={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;