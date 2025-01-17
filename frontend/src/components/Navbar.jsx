import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext/CartContext";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X } from 'lucide-react';
import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import logo from "../assets/logo/prime-logo-3.gif";

const Navbar = () => {
  const { cart, openCart } = useContext(CartContext);
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-4 left-12 right-12 flex justify-center z-10 mb-10">
      <div className="w-full bg-slate-50 bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-xl rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-4">
                <img src={logo} alt="PrimeEats Logo" className="h-20 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center space-x-8">
              <Link to="/">
                <button className="px-6 py-2 rounded-full bg-slate-50 text-black font-medium hover:bg-slate-300">
                  Home
                </button>
              </Link>
              
              <div className="flex items-center space-x-6">
                {isSignedIn ? (
                  <SignOutButton>
                    <button className="px-6 py-2 rounded-full bg-yellow-400 text-black font-medium hover:bg-yellow-500">
                      Logout
                    </button>
                  </SignOutButton>
                ) : (
                  <SignInButton>
                    <button className="px-6 py-2 rounded-full bg-yellow-400 text-black font-medium hover:bg-yellow-500">
                      Login
                    </button>
                  </SignInButton>
                )}
                
                <button
                  className="relative p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-500"
                  onClick={openCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                className="relative p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-500"
                onClick={openCart}
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={toggleMenu}
                className="text-gray-800 hover:bg-white hover:bg-opacity-20 inline-flex items-center justify-center p-2 rounded-md"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-b-2xl">
            <div className="px-2 pt-2 pb-3 space-y-4">
              <Link
                to="/"
                className="text-gray-800 hover:bg-white hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </Link>
              {isSignedIn ? (
                <SignOutButton>
                  <button className="w-full text-left px-3 py-2 text-gray-800 hover:bg-white hover:bg-opacity-20 rounded-md text-base font-medium">
                    Logout
                  </button>
                </SignOutButton>
              ) : (
                <SignInButton>
                  <button className="w-full text-left px-3 py-2 text-gray-800 hover:bg-white hover:bg-opacity-20 rounded-md text-base font-medium">
                    Login
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

