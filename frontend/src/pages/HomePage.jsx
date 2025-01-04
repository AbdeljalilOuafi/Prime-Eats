import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "../components/AddressInput";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const [error, setError] = useState(""); // State to handle errors
  const navigate = useNavigate(); // Hook for navigation

  const handleRestaurantsFetched = (data) => {
    if ((data.restaurants && data.restaurants.length > 0) || (data.chain_restaurants && data.chain_restaurants.length > 0)) {
      setError("");
      navigate("/restaurants", { state: { data } }); // Pass both restaurants and chain restaurants
    } else {
      setError("No restaurants found near this address."); // Set error message
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection>
        <AddressInput onRestaurantsFetched={handleRestaurantsFetched} />
      </HeroSection>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default HomePage;
