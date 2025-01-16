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

  const addToCart = (item, isUpdate = false) => {
    setCart(currentCart => {
      if (isUpdate) {
        // If updating an existing item
        return currentCart.map(cartItem => 
          cartItem.id === item.id && cartItem.restaurantId === item.restaurantId
            ? { ...item, quantity: Math.max(1, item.quantity) }
            : cartItem
        );
      } else {
        // Check if item already exists
        const existingItemIndex = currentCart.findIndex(
          cartItem => cartItem.id === item.id && cartItem.restaurantId === item.restaurantId
        );

        if (existingItemIndex !== -1) {
          // Update existing item quantity
          return currentCart.map((cartItem, index) => 
            index === existingItemIndex
              ? { 
                  ...cartItem, 
                  quantity: Math.max(1, cartItem.quantity + (item.quantity || 1))
                }
              : cartItem
          );
        }

        // Add new item with quantity validation
        return [...currentCart, { ...item, quantity: Math.max(1, item.quantity || 1) }];
      }
    });

    if (item.restaurantLocation) {
      setDeliveryInfo(prev => ({
        ...prev,
        restaurantLocation: item.restaurantLocation
      }));
    }
  };

  const updateCartItemQuantity = (itemId, restaurantId, newQuantity) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === itemId && item.restaurantId === restaurantId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  const removeFromCart = (id, restaurantId) => {
    setCart(cart.filter(item => !(item.id === id && item.restaurantId === restaurantId)));
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

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price);
      const quantity = item.quantity || 1;
      return total + (itemPrice * quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
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
      updateCartItemQuantity,
      removeFromCart, 
      openCart, 
      closeCart,
      deliveryInfo,
      updateDeliveryInfo,
      clearCart,
      getCartTotal,
      getCartItemCount,
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