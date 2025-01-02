import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext/CartContext";
import Navbar from "../components/Navbar";

const MenuPage = () => {
  const location = useLocation();
  const { restaurant } = location.state || {};
  const { addToCart } = useContext(CartContext);

  if (!restaurant) {
    return (
      <p className="text-center text-red-500 mt-4">
        No restaurant data available. Please go back and select a restaurant.
      </p>
    );
  }

  const { name, address, rating, image_url, menu } = restaurant;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex-grow p-4 mt-32">
        {/* Restaurant Information */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{name}</h1>
          <p className="text-gray-600">{address}</p>
          <p className="text-gray-600">Rating: {rating} ⭐</p>
          {image_url && (
            <img
              src={image_url}
              alt={name}
              className="w-full h-64 object-cover rounded-lg shadow-md mt-4"
            />
          )}
        </div>

        {/* Menu Display */}
        {menu &&
          Object.keys(menu).map((category) => (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-bold text-indigo-600">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {menu[category].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-lg overflow-hidden"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-sm text-gray-600 font-bold">
                        ${item.price.toFixed(2)}
                      </p>
                      <button
                        className="block w-full mt-2 bg-yellow-400 text-black p-2 rounded-md hover:bg-yellow-500"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MenuPage;