import { useEffect, useContext, useState, useRef } from "react";
import api from "../services/api";
import { AddressContext } from "../context/AddressContext/AddressContext";
import PropTypes from "prop-types";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader";
import Loader from "../components/Loader";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const AddressInput = ({ onRestaurantsFetched }) => {
  const { updateAddress } = useContext(AddressContext);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const autoCompleteRef = useRef(null);
  const inputRef = useRef(null);

  const abortController = useRef(null); // Ref to manage AbortController

  // Helper function to handle errors consistently
  const handleError = (errorMessage) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    let isSubscribed = true;

    const initializeGoogleMaps = async () => {
      if (!isSubscribed) return;

      try {
        setIsLoading(true);
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);

        if (!inputRef.current) {
          handleError("Input reference not found");
          return;
        }

        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            fields: ["formatted_address", "geometry", "place_id"],
          }
        );

        autoCompleteRef.current.addListener("place_changed", handlePlaceSelect);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        handleError("Error initializing Google Maps");
        console.error("Google Maps initialization error:", err);
      }
    };

    initializeGoogleMaps();

    return () => {
      isSubscribed = false;
      if (autoCompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autoCompleteRef.current);
      }
    };
  }, []);

  // Validate manual address
  // const validateAddress = async (address) => {
  //   return new Promise((resolve, reject) => {
  //     const geocoder = new window.google.maps.Geocoder();
  //     geocoder.geocode({ address }, (results, status) => {
  //       if (status === "OK" && results && results.length > 0 && results[0].geometry) {
  //         resolve(results[0]);
  //       } else {
  //         reject(new Error("Invalid address"));
  //       }
  //     });
  //   });
  // };

  // Handle place selection from autocomplete
  const handlePlaceSelect = async () => {
    if (!autoCompleteRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const place = autoCompleteRef.current.getPlace();

      if (!place.geometry) {
        handleError("Please select an address from the dropdown");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setInput(place.formatted_address);
      await fetchNearbyRestaurants(lat, lng, place.formatted_address);
    } catch (err) {
      handleError("Error selecting place");
      console.error("Place selection error:", err);
    }
  };

  // Fetch nearby restaurants
  const fetchNearbyRestaurants = async (latitude, longitude, fullAddress) => {
    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/restaurants/?latitude=${latitude}&longitude=${longitude}&radius=1500`,
        { signal }
      );

      updateAddress({
        fullAddress,
        latitude,
        longitude,
      });

      onRestaurantsFetched(response.data);
      setIsLoading(false);
      console.log("Restaurants fetched:", response.length);
    } catch (err) {
      if (signal.aborted) {
        console.warn("Request was aborted");
      } else if (err.response) {
        handleError(`Error: ${err.response.statusText}`);
      } else {
        handleError("Error fetching restaurants");
      }
      console.error("Error fetching restaurants:", err);
    }
  };

  // Handle manual address submission
  // const handleManualSubmit = async () => {
  //   if (!input.trim()) {
  //     handleError("Please enter an address");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     setError(null);

  //     const validatedAddress = await validateAddress(input);

  //     if (!validatedAddress || !validatedAddress.geometry) {
  //       handleError("Please enter a valid address");
  //       return;
  //     }

  //     const lat = validatedAddress.geometry.location.lat();
  //     const lng = validatedAddress.geometry.location.lng();

  //     await fetchNearbyRestaurants(lat, lng, validatedAddress.formatted_address);
  //   } catch (err) {
  //     handleError("Error submitting address");
  //     console.error("Geocoding error:", err);
  //   }
  // };

  // Handle geolocation
  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      handleError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geocoder = new window.google.maps.Geocoder();

          const result = await new Promise((resolve, reject) => {
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === "OK" && results && results.length > 0) {
                  resolve(results[0]);
                } else {
                  reject(new Error("Reverse geocoding failed"));
                }
              }
            );
          });

          setInput(result.formatted_address);
          await fetchNearbyRestaurants(latitude, longitude, result.formatted_address);
        } catch (err) {
          handleError("Error getting current location address");
          console.error("Reverse geocoding error:", err);
        }
      },
      (err) => {
        handleError("Error accessing location. Please enter address manually.");
        console.error("Geolocation error:", err);
      }
    );
  };

  return (
<div className="w-full max-w-4xl mx-auto mb-20 p-4">
      {isLoading && <Loader />}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder="What's your address?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-full p-4 pl-12 rounded-full bg-white text-gray-800 shadow-lg ${
            error ? 'border-red-500' : 'border-transparent'
          } focus:outline-none`}
          disabled={isLoading}
        />
        <div className="absolute left-4">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <button
          onClick={handleLocationClick}
          disabled={isLoading}
          className="absolute right-4 px-6 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 focus:outline-none"
        >
          Use your current location
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
};

AddressInput.propTypes = {
  onRestaurantsFetched: PropTypes.func.isRequired,
};

export default AddressInput;
