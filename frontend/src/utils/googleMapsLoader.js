let loadingPromise = null;

export const loadGoogleMapsScript = (apiKey) => {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    // Remove any existing Google Maps scripts
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      resolve(window.google.maps);
    };

    script.onerror = () => {
      reject(new Error('Google Maps script failed to load'));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
};