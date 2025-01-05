let loadingPromise = null;

export const loadGoogleMapsScript = (apiKey) => {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    // Remove any existing Google Maps scripts
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (existingScript) {
      document.head.removeChild(existingScript);
      loadingPromise = null; // Reset the promise since we're removing the script
    }

    // Create new script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up the callback
    window.initGoogleMaps = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
        // Clean up
        delete window.initGoogleMaps;
      } else {
        reject(new Error('Google Maps not available after initialization'));
      }
    };

    // Error handling
    script.onerror = () => {
      loadingPromise = null; // Reset promise on error
      delete window.initGoogleMaps;
      reject(new Error('Failed to load Google Maps SDK'));
    };

    // Set a timeout
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps) {
        loadingPromise = null;
        delete window.initGoogleMaps;
        script.remove();
        reject(new Error('Google Maps load timeout'));
      }
    }, 20000); // 20 second timeout

    // Success cleanup
    script.onload = () => {
      clearTimeout(timeoutId);
      if (!window.google?.maps) {
        // Wait for callback
        setTimeout(() => {
          if (!window.google?.maps) {
            loadingPromise = null;
            delete window.initGoogleMaps;
            reject(new Error('Google Maps not initialized after script load'));
          }
        }, 5000); // 5 second grace period
      }
    };

    // Append the script to the document
    document.head.appendChild(script);
  }).catch(error => {
    loadingPromise = null; // Reset promise on any error
    throw error; // Re-throw to maintain error chain
  });

  return loadingPromise;
};

// Helper to check if maps is already loaded
export const isGoogleMapsLoaded = () => {
  return !!window.google?.maps;
};

// Helper to clear the loading state
export const resetGoogleMapsLoader = () => {
  loadingPromise = null;
  delete window.initGoogleMaps;
};