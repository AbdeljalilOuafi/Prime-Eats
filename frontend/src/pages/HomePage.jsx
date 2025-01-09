import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "../components/ui/interactive-grid-pattern";
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
      {/* Interactive Grid Background */}
      <div className="fixed inset-0 bg-or pointer-events-auto">
        <InteractiveGridPattern
          className={cn(
            "absolute inset-0 w-full h-full",
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          )}
          width={20}
          height={20}
          squares={[80, 80]}
          // dotClassName="transition-colors duration-10 fill-white"
          squaresClassName=" hover:fill-orange-500"
        />
      </div>

      {/* Content Layer - Make it pointer-events-none by default */}
      <div className="relative pointer-events-none">
        {/* Individual sections - restore pointer-events for interactive elements */}
        <div className="pointer-events-auto">
          <Navbar />
        </div>

        <div className="pointer-events-auto">
          <HeroSection>
            <AddressInput onRestaurantsFetched={handleRestaurantsFetched} />
          </HeroSection>
          {error && (
            <p className="text-red-500 text-center mt-4 bg-white backdrop-blur-sm py-2">
              {error}
            </p>
          )}
        </div>

        <ServiceIntro />
        <ChainRestaurantSlider />
      </div>
    </div>
  );
};

export default HomePage;