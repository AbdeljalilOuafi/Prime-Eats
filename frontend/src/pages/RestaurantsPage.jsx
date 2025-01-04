import { useLocation, useNavigate } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const RestaurantsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = location.state || {};

  // Early return with navigation if no data
  if (!data?.restaurants?.length && !data?.chain_restaurants?.length) {
    navigate("/");
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-6 px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Available Restaurants</h2>
        
        {data.restaurants?.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Local Restaurants</h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {data.restaurants.map((restaurant) => (
                <motion.div
                  key={restaurant.id}
                  variants={itemVariants}
                  onClick={() => handleRestaurantClick(restaurant, false)}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                >
                  <RestaurantCard 
                    restaurant={restaurant}
                    isChain={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {data.chain_restaurants?.length > 0 && (
          <section>
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Chain Restaurants</h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {data.chain_restaurants.map((chain) => (
                <motion.div
                  key={chain.name}
                  variants={itemVariants}
                  onClick={() => handleRestaurantClick(chain, true)}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                >
                  <RestaurantCard 
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