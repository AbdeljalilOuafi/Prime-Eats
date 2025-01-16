import PropTypes from "prop-types";
import { createContext, useState, useEffect } from "react";

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [address, setAddress] = useState({
    fullAddress: "",
    latitude: null,
    longitude: null,
  });

  // Load address from sessionStorage on initial mount
  useEffect(() => {
    const savedAddress = sessionStorage.getItem('deliveryAddress');
    if (savedAddress) {
      try {
        const parsedAddress = JSON.parse(savedAddress);
        setAddress(parsedAddress);
      } catch (error) {
        console.error('Error parsing saved address:', error);
        sessionStorage.removeItem('deliveryAddress'); // Clear invalid data
      }
    }
  }, []);

  const updateAddress = (newAddress) => {
    setAddress(newAddress);
    // Save to sessionStorage whenever address is updated
    try {
      sessionStorage.setItem('deliveryAddress', JSON.stringify(newAddress));
    } catch (error) {
      console.error('Error saving address to sessionStorage:', error);
    }
  };

  return (
    <AddressContext.Provider value={{ address, updateAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

AddressProvider.propTypes = {
  children: PropTypes.node.isRequired,
};