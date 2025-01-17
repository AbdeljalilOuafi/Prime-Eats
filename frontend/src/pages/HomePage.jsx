import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "../components/ui/interactive-grid-pattern";
import AddressInput from "../components/AddressInput";
import MouseImageTrail from "../components/MouseImageTrail";
import Navbar from "../components/Navbar";
import ServiceIntro from "../components/ServiceIntro";
import ChainRestaurantSlider from "../components/ChainRestaurantSlider";
import img1 from "../assets/imgs/1.jpg";
import img2 from "../assets/imgs/2.jpg";
import img3 from "../assets/imgs/3.jpg";
import img4 from "../assets/imgs/4.jpg";
import img5 from "../assets/imgs/5.jpg";

const HomePage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const images = [img1, img2, img3, img4, img5];

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
          squaresClassName="hover:fill-orange-500"
        />
      </div>

      {/* Hero Section */}
<div className="relative h-[450px] overflow-visible -mt-[64px]"> {/* Added negative margin to offset navbar height */}
  {/* MouseImageTrail Container */}
  <div className="absolute top-0 left-0 right-0 h-[550px] z-10"> 
    <MouseImageTrail
      renderImageBuffer={50}
      rotationRange={25}
      images={images}
    >
      <div className="w-full h-[550px] bg-gradient-to-r from-orange-500 from-30% via-orange-500 to-orange-600" />
    </MouseImageTrail>
  </div>

  {/* Content Overlay */}
  <div className="relative z-50 pt-[64px]"> {/* Added padding-top to compensate for negative margin */}
    <Navbar />
    <div className="mt-[200px]">
      <AddressInput onRestaurantsFetched={handleRestaurantsFetched} />
    </div>
  </div>
</div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-center mt-4 bg-white backdrop-blur-sm py-2 z-50 relative">
          {error}
        </p>
      )}

      {/* Rest of the content */}
      <div className="relative z-20 mt-24">
        <ServiceIntro />
        <ChainRestaurantSlider />
      </div>
    </div>
  );
};

export default HomePage;