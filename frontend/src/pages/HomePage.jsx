import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "../components/ui/interactive-grid-pattern";
import AddressInput from "../components/AddressInput";
import MouseImageTrail from "../components/MouseImageTrail";
import Navbar from "../components/Navbar";
import ServiceIntro from "../components/ServiceIntro";
import ChainRestaurantSlider from "../components/ChainRestaurantSlider";
// Import all images
import img1 from "../assets/imgs/1.jpg";
import img2 from "../assets/imgs/2.jpg";
import img3 from "../assets/imgs/3.jpg";
import img4 from "../assets/imgs/4.jpg";
import img5 from "../assets/imgs/5.jpg";
import img6 from "../assets/imgs/6.jpg";
import img7 from "../assets/imgs/7.jpg";
import img8 from "../assets/imgs/8.jpg";
import img9 from "../assets/imgs/9.jpg";
import img10 from "../assets/imgs/10.jpg";

const HomePage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Array of imported images
  const images = [
    img1, img2, img3, img4, img5,
    img6, img7, img8, img9, img10
  ];

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
        <div className="relative pointer-events-auto z-30">
          <Navbar />
        </div>

        <div className="relative pointer-events-auto">
          <MouseImageTrail
            renderImageBuffer={50}
            rotationRange={25}
            images={images}
          >
          <section className=" p-32 pt-48 top-0 left-0 right-0 h-[450px] w-full place-content-center bg-gradient-to-r from-orange-500 from-30% via-orange-500  to-orange-600 opacity">  
            <AddressInput onRestaurantsFetched={handleRestaurantsFetched} />
          </section>
          </MouseImageTrail>
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