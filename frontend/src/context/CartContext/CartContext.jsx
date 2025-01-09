import { createContext, useState } from "react";
import PropTypes from 'prop-types';
import CartPopup from "../../components/CartPopup";

export const CartContext = createContext();

export const CartProvider = ({ children, isSignedIn, navigate }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    location: { lat: null, lng: null },
    restaurantLocation: { lat: null, lng: null }
  });

  const addToCart = (item) => {
    // Also store restaurant location when adding items
    setCart([...cart, item]);
    if (item.restaurantLocation) {
      setDeliveryInfo(prev => ({
        ...prev,
        restaurantLocation: item.restaurantLocation
      }));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateDeliveryInfo = (info) => {
    setDeliveryInfo(prev => ({
      ...prev,
      ...info
    }));
  };

  const openCart = () => {
    if (isSignedIn) {
      setIsCartOpen(true);
    } else {
      sessionStorage.setItem("prevUrl", window.location.pathname);
      navigate("/sign-in");
    }
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryInfo({
      address: '',
      location: { lat: null, lng: null },
      restaurantLocation: { lat: null, lng: null }
    });
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      openCart, 
      closeCart,
      deliveryInfo,
      updateDeliveryInfo,
      clearCart,
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