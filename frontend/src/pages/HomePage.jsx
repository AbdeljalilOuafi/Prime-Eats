import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "../components/AddressInput";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";

const HomePage = () => {
  // const { address } = useContext(AddressContext); // Access address from context
  const [error, setError] = useState(""); // State to handle errors
  const navigate = useNavigate(); // Hook for navigation

  // Function to handle fetched restaurants
  const handleRestaurantsFetched = (data) => {
    if (data.restaurants && data.restaurants.length > 0) {
      setError("");
      navigate("/restaurants", { state: { restaurants: data.restaurants } }); // Redirect with data
    } else {
      setError("No restaurants found near this address."); // Set error message
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar component */}
      <Navbar />

      {/* Hero section with address input */}
      <HeroSection>
        <AddressInput onRestaurantsFetched={handleRestaurantsFetched} />
      </HeroSection>

      {/* Display an error message if no restaurants are found */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default HomePage;
