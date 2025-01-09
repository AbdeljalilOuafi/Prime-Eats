import PropTypes from "prop-types";

const ChainRestaurantCard = ({ restaurant }) => {
    const { name, image_url } = restaurant;
    
    return (
      <div className="relative group rounded-lg overflow-hidden shadow-lg bg-white">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={image_url}
            alt={name}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <button 
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
            onClick={() => console.log(`View menu for ${name}`)}
          >
            View Menu
          </button>
        </div>
      </div>
    );
  };
  
 
  
  
  ChainRestaurantCard.propTypes = {
    restaurant: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image_url: PropTypes.string.isRequired,
    }).isRequired,
  };

  export default ChainRestaurantCard;