import { useEffect, useContext, useState, useRef } from "react";
import api from "../services/api";
import { AddressContext } from "../context/AddressContext/AddressContext";
import PropTypes from "prop-types";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader";
import Loader from "../components/Loader";
import { MapPin } from "lucide-react";
// import { Loader2, MapPin, Navigation } from "lucide-react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const AddressInput = ({ onRestaurantsFetched }) => {
  const { address, updateAddress } = useContext(AddressContext);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const autoCompleteRef = useRef(null);
  const inputRef = useRef(null);
  const abortController = useRef(null);

  // Initialize input with saved address if it exists
  useEffect(() => {
    if (address.fullAddress) {
      setInput(address.fullAddress);
    }
  }, [address.fullAddress]);

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
        `/restaurants/?latitude=${latitude}&longitude=${longitude}&radius=1000`,
        { signal }
      );

      const addressData = {
        fullAddress,
        latitude,
        longitude,
      };

      // Update both context and sessionStorage
      updateAddress(addressData);

      onRestaurantsFetched(response.data);
      setIsLoading(false);
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
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-20 p-4">
      {isLoading && <Loader />}
      <div className="relative flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
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
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
        </div>

        <button
          onClick={handleLocationClick}
          disabled={isLoading}
          className={`
            flex
            items-center
            justify-center
            gap-2
            px-6
            py-3
            sm:py-2
            w-full
            sm:w-auto
            rounded-full
            bg-yellow-400
            text-black
            font-semibold
            transition-all
            duration-200
            hover:bg-yellow-500
            focus:outline-none
            focus:ring-2
            focus:ring-yellow-400/50
            disabled:opacity-60
            disabled:cursor-not-allowed
            whitespace-nowrap
            shadow-md
            hover:shadow-lg
          `}
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