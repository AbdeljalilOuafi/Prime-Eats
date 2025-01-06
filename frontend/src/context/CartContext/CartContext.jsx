import { createContext, useState } from "react";
import PropTypes from 'prop-types';
import CartPopup from "../../components/CartPopup";

export const CartContext = createContext();

export const CartProvider = ({ children, isSignedIn, navigate }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const openCart = () => {
    if (isSignedIn) {
      setIsCartOpen(true);
    } else {
      // Store the current URL before redirecting to login
      sessionStorage.setItem("prevUrl", window.location.pathname);
      navigate("/sign-in");
    }
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const proceedToPayment = () => {
    closeCart();
    navigate("/payment");
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      openCart, 
      closeCart,
      proceedToPayment,
      isCartOpen 
    }}>
      {children}
      {isCartOpen && <CartPopup />}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
  isSignedIn: PropTypes.bool.isRequired,
  navigate: PropTypes.func.isRequired,
};