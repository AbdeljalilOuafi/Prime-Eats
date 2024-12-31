import PropTypes from "prop-types";

const RestaurantCard = ({ restaurant }) => {
  const { name, address, image_url, rating } = restaurant;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img
        src={image_url || "https://via.placeholder.com/300"}
        alt={name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600">{address}</p>
        <p className="text-sm text-gray-600">Rating: {rating || "N/A"}</p>
      </div>
    </div>
  );
};

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    rating: PropTypes.number,
  }).isRequired,
};

export default RestaurantCard;
