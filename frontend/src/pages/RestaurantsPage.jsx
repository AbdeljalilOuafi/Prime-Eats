import { useLocation, useNavigate } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const RestaurantsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurants } = location.state || {}; // Retrieve restaurants from state

  if (!restaurants || restaurants.length === 0) {
    // Redirect back to the home page if no restaurants data is present
    navigate("/");
    return null;
  }

  // Navigate to the menu page for a specific restaurant
  const handleRestaurantClick = (restaurant) => {
    navigate("/menu", { state: { restaurant } }); // Pass restaurant data to menu page
  };

  return (
    <div className="min-h-screen">
      {/* Navbar component */}
      <Navbar />

      <div className="max-w-7xl mx-auto mt-6 px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Available Restaurants
        </h2>

        {/* Display restaurants in a grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.25, // Stagger children animations
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={index}
              onClick={() => handleRestaurantClick(restaurant)}
              className="cursor-pointer transform hover:scale-105 transition-transform"
              variants={{
                hidden: { opacity: 0, y: 20 }, // Initial state
                show: { opacity: 1, y: 0 }, // Animated state
              }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantsPage;
