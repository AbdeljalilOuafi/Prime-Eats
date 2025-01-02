import { useContext } from "react";
import { CartContext } from "../context/CartContext/CartContext";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import logo from "../assets/logo/prime-logo-3.gif";

const Navbar = () => {
  const { cart, openCart } = useContext(CartContext);
  const { isSignedIn } = useUser();

  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src={logo} alt="PrimeEats Logo" className="h-16 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
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
      </div>
    </header>
  );
};

export default Navbar;