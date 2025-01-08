import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "../components/AddressInput";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import ServiceIntro from "../components/ServiceIntro";
import ChainRestaurantSlider from "../components/ChainRestaurantSlider";

const HomePage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRestaurantsFetched = (data) => {
    if ((data.restaurants?.length > 0) || (data.chain_restaurants?.length > 0)) {
      setError("");
      navigate("/restaurants", { state: { data } });
    } else {
      setError("No restaurants found near this address.");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection>
        <AddressInput onRestaurantsFetched={handleRestaurantsFetched} />
      </HeroSection>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      <ChainRestaurantSlider />
      <ServiceIntro />
    </div>
  );
};

export default HomePage;