import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loadGoogleMapsScript, isGoogleMapsLoaded, resetGoogleMapsLoader } from '../utils/googleMapsLoader';
import PropTypes from 'prop-types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DELIVERY_RADIUS_KM = 0.5; // 500 meters in kilometers
const KM_TO_DEGREES = 0.009; // roughly 1km = 0.009 degrees

const MAP_STYLES = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7c93a3" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }]
  }
];

const ORDER_STATUSES = {
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  PICKED_UP: 'picked_up',
  EN_ROUTE: 'en_route',
  DELIVERED: 'delivered'
};

const STATUS_CONFIG = {
  [ORDER_STATUSES.CONFIRMED]: {
    label: 'Order Confirmed',
    description: 'Restaurant received your order',
    icon: CheckCircle,
    duration: 5000,
  },
  [ORDER_STATUSES.PREPARING]: {
    label: 'Preparing Your Order',
    description: 'Restaurant is preparing your food',
    icon: Package,
    duration: 10000,
  },
  [ORDER_STATUSES.PICKED_UP]: {
    label: 'Order Picked Up',
    description: 'Driver picked up your order',
    icon: MapPin,
    duration: 5000,
  },
  [ORDER_STATUSES.EN_ROUTE]: {
    label: 'On the Way',
    description: 'Driver is heading to your location',
    icon: MapPin,
    duration: 15000,
  },
  [ORDER_STATUSES.DELIVERED]: {
    label: 'Delivered',
    description: 'Enjoy your meal!',
    icon: CheckCircle,
    duration: 0,
  },
};

// Calculate distance between two points in kilometers
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateZoomLevel = (distance) => {
  if (distance <= 0.5) return 16;
  if (distance <= 1) return 15;
  return 14;
};

// Generate a random point within radius km of center
const generateNearbyPoint = (center, radiusKm) => {
  // Convert radius from km to degrees (approximate)
  const radiusDegrees = radiusKm * KM_TO_DEGREES;
  
  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;
  
  // Generate random radius within the maximum radius
  const radius = Math.sqrt(Math.random()) * radiusDegrees;
  
  // Calculate offset
  const lat = center.lat + radius * Math.cos(angle);
  const lng = center.lng + radius * Math.sin(angle);
  
  return { lat, lng };
};

const OrderTracking = ({ orderId, deliveryLocation, deliveryAddress }) => {
  const [currentStatus, setCurrentStatus] = useState(ORDER_STATUSES.CONFIRMED);
  const [estimatedTime, setEstimatedTime] = useState(35);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const restaurantLocationRef = useRef(null);

  const validateAndAdjustLocations = useCallback(() => {
    if (!deliveryLocation || typeof deliveryLocation.lat !== 'number' || typeof deliveryLocation.lng !== 'number') {
      throw new Error('Invalid delivery location coordinates');
    }

    // Generate nearby restaurant location if not already set
    if (!restaurantLocationRef.current) {
      restaurantLocationRef.current = generateNearbyPoint(deliveryLocation, DELIVERY_RADIUS_KM);
    }

    return {
      restaurant: restaurantLocationRef.current,
      delivery: deliveryLocation
    };
  }, [deliveryLocation]);

  const createCustomMarker = (color, icon) => {
    const markerSvg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="${color}" stroke="white" stroke-width="2"/>
        ${icon}
      </svg>
    `;

    return new window.google.maps.Marker({
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      }
    });
  };

  const animateMarker = useCallback((progress) => {
    if (!markerRef.current || currentStatus !== ORDER_STATUSES.EN_ROUTE) return;

    const coords = validateAndAdjustLocations();
    const lat = coords.restaurant.lat + (coords.delivery.lat - coords.restaurant.lat) * progress;
    const lng = coords.restaurant.lng + (coords.delivery.lng - coords.restaurant.lng) * progress;
    
    markerRef.current.setPosition(new window.google.maps.LatLng(lat, lng));
  }, [validateAndAdjustLocations, currentStatus]);

  const startAnimation = useCallback(() => {
    if (currentStatus !== ORDER_STATUSES.EN_ROUTE) return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / 15000, 1);
      
      animateMarker(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentStatus, animateMarker]);

  const initializeMap = useCallback(async () => {
    try {
      if (!mapRef.current) throw new Error('Map container not initialized');

      const coords = validateAndAdjustLocations();
      
      if (!isGoogleMapsLoaded()) {
        resetGoogleMapsLoader();
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
      }

      // Calculate center and zoom based on delivery radius
      const center = {
        lat: (coords.restaurant.lat + coords.delivery.lat) / 2,
        lng: (coords.restaurant.lng + coords.delivery.lng) / 2
      };

      const distance = calculateDistance(coords.restaurant, coords.delivery);
      const zoom = calculateZoomLevel(distance);

      const mapOptions = {
        zoom,
        center,
        mapId: 'demo_map',
        disableDefaultUI: true,
        styles: MAP_STYLES,
        restriction: {
          latLngBounds: {
            north: coords.delivery.lat + (DELIVERY_RADIUS_KM * KM_TO_DEGREES * 2),
            south: coords.delivery.lat - (DELIVERY_RADIUS_KM * KM_TO_DEGREES * 2),
            east: coords.delivery.lng + (DELIVERY_RADIUS_KM * KM_TO_DEGREES * 2),
            west: coords.delivery.lng - (DELIVERY_RADIUS_KM * KM_TO_DEGREES * 2),
          },
          strictBounds: false
        }
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add delivery radius circle
      new window.google.maps.Circle({
        map: mapInstanceRef.current,
        center: coords.delivery,
        radius: DELIVERY_RADIUS_KM * 1000, // Convert to meters
        fillColor: '#4A90E2',
        fillOpacity: 0.1,
        strokeColor: '#4A90E2',
        strokeOpacity: 0.8,
        strokeWeight: 1
      });

      // Create markers
      const restaurantMarker = createCustomMarker('#FF4444', '<text x="20" y="24" text-anchor="middle" fill="white">R</text>');
      restaurantMarker.setMap(mapInstanceRef.current);
      restaurantMarker.setPosition(coords.restaurant);

      const deliveryMarker = createCustomMarker('#44FF44', '<text x="20" y="24" text-anchor="middle" fill="white">D</text>');
      deliveryMarker.setMap(mapInstanceRef.current);
      deliveryMarker.setPosition(coords.delivery);

      markerRef.current = createCustomMarker('#4444FF', '<text x="20" y="24" text-anchor="middle" fill="white">🛵</text>');
      markerRef.current.setMap(mapInstanceRef.current);
      markerRef.current.setPosition(coords.restaurant);

      // Draw route
      const path = new window.google.maps.Polyline({
        path: [coords.restaurant, coords.delivery],
        geodesic: true,
        strokeColor: '#4A90E2',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: mapInstanceRef.current
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error.message);
      setIsLoading(false);
    }
  }, [validateAndAdjustLocations]);

  useEffect(() => {
    initializeMap();
    return () => {
      if (markerRef.current) markerRef.current.setMap(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    if (currentStatus === ORDER_STATUSES.DELIVERED) return;

    const currentConfig = STATUS_CONFIG[currentStatus];
    const timer = setTimeout(() => {
      const statusOrder = Object.values(ORDER_STATUSES);
      const currentIndex = statusOrder.indexOf(currentStatus);
      if (currentIndex < statusOrder.length - 1) {
        setCurrentStatus(statusOrder[currentIndex + 1]);
        setEstimatedTime(prev => Math.max(0, prev - 5));
      }
    }, currentConfig.duration);

    return () => clearTimeout(timer);
  }, [currentStatus]);

  useEffect(() => {
    if (currentStatus === ORDER_STATUSES.EN_ROUTE) {
      startTimeRef.current = null;
      startAnimation();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentStatus, startAnimation]);

  const renderTimeline = () => {
    const statusOrder = Object.values(ORDER_STATUSES);
    return (
      <div className="space-y-4">
        {statusOrder.map((status, index) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const isActive = currentStatus === status;
          const isPast = statusOrder.indexOf(currentStatus) > index;

          return (
            <div
              key={status}
              className={`flex items-center space-x-4 ${
                isActive ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <div>
                <div className="font-medium">{config.label}</div>
                <div className="text-sm text-gray-500">{config.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Order #{orderId} Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Clock className="w-4 h-4" />
            <AlertDescription>
              Estimated delivery time: {estimatedTime} minutes
            </AlertDescription>
          </Alert>

          <div className="w-full h-64 rounded-lg mb-6 overflow-hidden">
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-500">Loading map...</span>
              </div>
            )}
            {mapError && (
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <span className="text-red-500">{mapError}</span>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Delivery Address</h3>
            <p className="text-gray-600">{deliveryAddress}</p>
          </div>

          {renderTimeline()}
        </CardContent>
      </Card>
    </div>
  );
};

OrderTracking.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  deliveryLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  deliveryAddress: PropTypes.string.isRequired,
};

export default OrderTracking;