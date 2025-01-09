import { useRef } from "react";
import PropTypes from "prop-types";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = 32.5 / 2;

const TiltRestaurantCard = ({ restaurant, isChain = false }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x);
  const ySpring = useSpring(y);
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / rect.height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / rect.width - HALF_ROTATION_RANGE;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Destructure values with fallbacks for safety
  const { name, menu, image_url, address, rating } = restaurant;

  // Determine image URL based on restaurant type
  const cardImageUrl = isChain ? menu?.image_url : image_url;

  // Determine address display
  const displayAddress = isChain 
    ? "Chain Restaurant - Multiple Locations" 
    : (address || "Address not available");

  // Only show rating for non-chain restaurants
  const displayRating = isChain ? null : rating;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
        perspective: "1000px"
      }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Image Section with 3D effect */}
      <div 
        className="relative h-48"
        style={{
          transform: "translateZ(20px)",
          transformStyle: "preserve-3d"
        }}
      >
        <img
          src={cardImageUrl || "/placeholder-restaurant.jpg"}
          alt={`${name} restaurant`}
          className="w-full h-full object-cover"
        />
        {isChain && (
          <div 
            className="absolute top-4 right-4"
            style={{ transform: "translateZ(5px)" }}
          >
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              Chain
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section with 3D effect */}
      <div 
        className="p-4"
        style={{
          transform: "translateZ(30px)",
          transformStyle: "preserve-3d"
        }}
      >
        <h3 
          className="text-xl font-bold text-gray-800 mb-2"
          style={{ transform: "translateZ(10px)" }}
        >
          {name}
        </h3>
        
        <p 
          className="text-sm text-gray-600 mb-2"
          style={{ transform: "translateZ(15px)" }}
        >
          {displayAddress}
        </p>
        
        {displayRating && (
          <div 
            className="flex items-center"
            style={{ transform: "translateZ(20px)" }}
          >
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

TiltRestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    rating: PropTypes.number,
    image_url: PropTypes.string,
    menu: PropTypes.shape({
      image_url: PropTypes.string
    })
  }).isRequired,
  isChain: PropTypes.bool
};

export default TiltRestaurantCard;