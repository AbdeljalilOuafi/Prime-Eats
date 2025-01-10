import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import navbarAboutPage from '../../assets/hero/navbar-aboutpage.png'

export default function AboutHero() {
  return (
    <div className="relative bg-white">
      {/* Hero Image Section */}
      <div className="relative h-[75vh] m-0 w-full overflow-hidden ps-200">
        <img
          src={navbarAboutPage}
          alt="image"
          className="object-contain w-full h-auto"
        />
      </div>

      {/* Text Overlay Section */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <UtensilsCrossed className="w-16 h-16 text-yellow-500 mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About PrimeEats
        </h1>
        <p className="text-xl text-white max-w-2xl">
          Connecting food lovers with the best local restaurants since 2024
        </p>
      </div>
    </div>
  );
};
