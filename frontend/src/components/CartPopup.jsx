import { useContext } from "react";
import { CartContext } from "../context/CartContext/CartContext";
import { X, ShoppingCart, AlertCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";

const CartPopup = () => {
  const { cart, removeFromCart, closeCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleCheckout = () => {
    if (!isSignedIn) {
      // Store current URL in session storage before redirecting
      sessionStorage.setItem("prevUrl", "/checkout");
      navigate("/sign-in");
    } else {
      closeCart();
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : "0.00";
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const itemPrice = Number(item.price);
      return sum + (!isNaN(itemPrice) ? itemPrice : 0);
    }, 0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeCart}
        className="fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer bg-slate-900/20 backdrop-blur p-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: "12.5deg" }}
          animate={{ scale: 1, rotate: "0deg" }}
          exit={{ scale: 0, rotate: "0deg" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-orange-700 to-orange-500 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
        >
          <ShoppingCart className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
          <button 
            className="absolute right-4 top-4 p-2 text-white/70 hover:text-white w-12 h-12 flex items-center justify-center z-50 cursor-pointer"
            onClick={closeCart}
          >
            <X className="w-8 h-8"/>
          </button>
          
          <div className="relative z-10">
            <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-orange-600 grid place-items-center mx-auto">
            <ShoppingCart />
            </div>
            <h2 className="text-3xl font-bold text-center mb-6">Your Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center mb-6">
                <AlertCircle className="mx-auto mb-2 w-12 h-12 text-white/70" />
                <p className="text-white/70">Your cart is empty.</p>
              </div>
            ) : (
              <div>
                <ul className="mb-6 space-y-4">
                  {cart.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-white/70">${formatPrice(item.price)}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="font-bold text-xl mb-6 text-center">
                    Total: ${formatPrice(calculateTotal(cart))}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={closeCart}
                      className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="bg-white hover:opacity-90 transition-opacity text-orange-600 font-semibold w-full py-2 rounded flex items-center justify-center gap-2"
                    >
                      {!isSignedIn && <LogIn className="w-4 h-4" />}
                      {isSignedIn ? 'Checkout' : 'Sign in to Checkout'}
                    </button>
                  </div>
                  {!isSignedIn && (
                    <p className="text-sm text-white/70 text-center mt-4">
                      Sign in to complete your order
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CartPopup;