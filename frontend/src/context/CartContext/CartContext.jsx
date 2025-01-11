import { createContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import CartPopup from "../../components/CartPopup";

export const CartContext = createContext();

export const CartProvider = ({ children, isSignedIn, navigate }) => {
  // Initialize cart from localStorage if available
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('foodDeliveryCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(() => {
    const savedDeliveryInfo = localStorage.getItem('deliveryInfo');
    return savedDeliveryInfo ? JSON.parse(savedDeliveryInfo) : {
      address: '',
      location: { lat: null, lng: null },
      restaurantLocation: { lat: null, lng: null }
    };
  });

  // Handle post-login navigation
  useEffect(() => {
    if (isSignedIn) {
      const pendingCheckout = sessionStorage.getItem("pendingCheckout");
      if (pendingCheckout === "true") {
        sessionStorage.removeItem("pendingCheckout");
        navigate("/checkout");
      }
    }
  }, [isSignedIn, navigate]);

  // Persist cart to localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('foodDeliveryCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('foodDeliveryCart');
    }
  }, [cart]);

  // Persist delivery info to localStorage
  useEffect(() => {
    if (deliveryInfo.address) {
      localStorage.setItem('deliveryInfo', JSON.stringify(deliveryInfo));
    } else {
      localStorage.removeItem('deliveryInfo');
    }
  }, [deliveryInfo]);

  const addToCart = (item) => {
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
    setIsCartOpen(true);
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
    localStorage.removeItem('foodDeliveryCart');
    localStorage.removeItem('deliveryInfo');
  };

  const proceedToCheckout = () => {
    if (!isSignedIn) {
      sessionStorage.setItem("pendingCheckout", "true");
      navigate("/sign-in");
    } else {
      closeCart();
      navigate("/checkout");
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/order-tracking');
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
      handlePaymentSuccess,
      proceedToCheckout,
      isCartOpen,
      isSignedIn 
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