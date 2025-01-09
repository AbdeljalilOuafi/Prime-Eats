import { useLocation, Navigate } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking';
import Navbar from '../components/Navbar';

const OrderTrackingPage = () => {
  const location = useLocation();

  // Redirect to home if no order data is available
  if (!location.state?.orderId || !location.state?.deliveryAddress) {
    return <Navigate to="/" replace />;
  }

  const {
    orderId,
    restaurantLocation,
    deliveryLocation,
    deliveryAddress
  } = location.state;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <OrderTracking
          orderId={orderId}
          restaurantLocation={restaurantLocation}
          deliveryLocation={deliveryLocation}
          deliveryAddress={deliveryAddress}
        />
      </div>
    </div>
  );
};

export default OrderTrackingPage;