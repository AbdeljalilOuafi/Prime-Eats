import PropTypes from "prop-types";
import { motion } from "framer-motion";
import StaticImage from "./StaticImage";

const RestaurantCard = ({ restaurant, isChain = false }) => {
  const { 
    name,
    menu,
    image_url,
    address,
    rating,
    id
  } = restaurant;

  const cardImageUrl = isChain 
    ? menu?.image_url 
    : image_url;

  const displayAddress = isChain 
    ? "Chain Restaurant - Multiple Locations" 
    : (address || "Address not available");

  const displayRating = isChain ? null : rating;

  return (
    <motion.div 
      className="bg-white shadow-lg rounded-xl overflow-hidden h-full pointer-events-auto"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative h-48">
        <StaticImage
          src={cardImageUrl}
          alt={`${name} restaurant`}
          className="w-full h-full object-cover"
          restaurantId={id || name} // Use name as fallback for chain restaurants
        />
        {isChain && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              Chain
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          {displayAddress}
        </p>
        
        {displayRating && (
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">⭐</span>
            <span className="text-sm text-gray-600">
              {displayRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    rating: PropTypes.number,
    image_url: PropTypes.string,
    id: PropTypes.string,
    menu: PropTypes.shape({
      image_url: PropTypes.string
    })
  }).isRequired,
  isChain: PropTypes.bool
};

export default RestaurantCard;