import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { SignIn, SignUp, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import PaymentPage from "./pages/PaymentPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import Footer from "./components/Footer/Footer";
import { CartProvider } from "./context/CartContext/CartContext"; // Import CartProvider
import { AddressProvider } from "./context/AddressContext/AddressContext";
import RestaurantsPage from "./pages/RestaurantsPage";
import PropTypes from "prop-types";
import { useClerkAuth } from "./hooks/useClerkAuth";
import { useEffect } from "react";
import AboutPage from "./components/About/AboutPage";
import FAQPage from "./components/FAQ/FAQPage";
import FAQSection from "./components/FAQ/FAQSection";
import ContactPage from "./components/Contact/ContactPage";
import TermsConditions from "./components/Terms&Conditions/Terms&Conditions";
import UpdateTitle from "./components/UpdateTitle";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";
import CookiesPolicy from "./components/CookiesPolicy/CookiesPolicy";
import CartPage from "./pages/CartPage";

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

function AppContent() {
  const navigate = useNavigate(); // Move useNavigate here
  const { isSignedIn } = useUser(); // Get the user's authentication status

  useEffect(() => {
    const prevUrl = sessionStorage.getItem("prevUrl");
    if (prevUrl) {
      sessionStorage.removeItem("prevUrl"); // Clear the stored URL
      navigate(prevUrl); // Redirect to the previous URL
    }
  }, [navigate]);

  useClerkAuth();

  return (

    <CartProvider isSignedIn={isSignedIn} navigate={navigate}> {/* Wrap with CartProvider */}
        <AddressProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
              <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
              <Route path="/aboutPage" element={<AboutPage />} />
              <Route path="/FAQPage" element={<FAQSection />} />
              <Route path="/ContactPage" element={<ContactPage />} />
              <Route path="/Terms & Conditions" element={<TermsConditions />} />
              <Route path="/Privacy Policy" element={<PrivacyPolicy />} />
              <Route path="/Cookies Policy" element={<CookiesPolicy />} />
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

function App() {
  return (
    <Router>
      <AppContent /> {/* Render AppContent inside Router */}
    </Router>
  );
}

export default App;
