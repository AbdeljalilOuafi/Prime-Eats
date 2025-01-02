import Footer from "./footer/Footer";
import HeroSection from "./Header/HeroSection";
import Navbar from "./Header/Navbar";

export default function HomePage() {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <HeroSection />
        <Footer />
      </div>
    )
}
