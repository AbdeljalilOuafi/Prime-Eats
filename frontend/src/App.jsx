// App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage";
import AboutPage from "./Components/About/AboutPage";
import FAQPage from "./Components/FAQ/FAQPage";
import FAQSection from "./Components/FAQ/FAQSection";
import ContactPage from "./Components/Contact/ContactPage";
import TermsConditions from "./Components/Terms&Conditions/Terms&Conditions";
import UpdateTitle from "./Components/UpdateTitle";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
import CookiesPolicy from "./Components/CookiesPolicy/CookiesPolicy";


export default function App() {
  return (
    <BrowserRouter>
      <UpdateTitle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutPage" element={<AboutPage />} />
        <Route path="/FAQPage" element={<FAQSection />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/Terms & Conditions" element={<TermsConditions />} />
        <Route path="/Privacy Policy" element={<PrivacyPolicy />} />
        <Route path="/Cookies Policy" element={<CookiesPolicy />} />
      </Routes>
    </BrowserRouter>
  );
  document.getElementById('root')
}
