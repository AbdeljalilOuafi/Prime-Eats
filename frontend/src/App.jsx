import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignIn, SignUp, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext/CartContext";
import { AddressProvider } from "./context/AddressContext/AddressContext";
import RestaurantsPage from "./pages/RestaurantsPage";
import PropTypes from "prop-types";
import { useClerkAuth } from "./hooks/useClerkAuth"; 

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isSignedIn } = useUser();
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }
  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  useClerkAuth();
  return (
      <CartProvider>
        <AddressProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
              <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
              
              {/* Protected routes */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              <Route path="/order-tracking" element={
                <ProtectedRoute>
                  <OrderTrackingPage />
                </ProtectedRoute>
              } />
              <Route path="/confirmation" element={
                <ProtectedRoute>
                  <ConfirmationPage />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />
          </Router>
        </AddressProvider>
      </CartProvider>
  );
}



export default App;