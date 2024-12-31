import PropTypes from "prop-types";
import heroImage from "../assets/hero/hero-final.png";

const HeroSection = ({ children }) => {
  return (
    <main className="relative">
      {/* Background wrapper that starts from top of viewport */}
      <div 
        className="absolute top-0 left-0 right-0 h-[550px] w-full"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        {/* <div className="absolute inset-0 bg-black opacity-50" /> */}
      </div>

      {/* Curved bottom edge */}
      {/* <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="white" fillOpacity="1" d="M0,96L1440,192L1440,320L0,320Z"></path>
        </svg>
      </div> */}

      {/* Content */}
      <div className="relative flex flex-col justify-center items-center px-6" style={{ minHeight: '550px' }}>
      {children}
      </div>
    </main>
  );
};

HeroSection.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HeroSection;