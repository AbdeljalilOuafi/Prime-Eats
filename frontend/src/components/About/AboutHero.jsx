import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import navbarAboutPage from '../../assets/hero/navbar-aboutpage.jpg';

export default function AboutHero() {
  return (
    <div className="relative bg-white">
      <div className="relative h-[65vh] w-full overflow-hidden">
        <img
          src={navbarAboutPage}
          alt="A welcoming dinner table with food and decorations"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      <div className="relative flex flex-col items-center justify-center text-center px-4 bg-white py-12 -mt-16 shadow-lg">
        <UtensilsCrossed
          className="w-16 h-16 text-orange-500 mb-6 drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
          }}
        />
        <h1 className="text-4xl text-orange-500 md:text-5xl font-bold mb-4">
          About PrimeEats
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
          Connecting food lovers with local flavors, swiftly and reliably.
        </p>
      </div>
    </div>
  );
}
