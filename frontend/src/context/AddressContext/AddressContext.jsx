/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useState } from "react";

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [address, setAddress] = useState({
    fullAddress: "",
    latitude: null,
    longitude: null,
  });

  const updateAddress = (newAddress) => {
    setAddress(newAddress);
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