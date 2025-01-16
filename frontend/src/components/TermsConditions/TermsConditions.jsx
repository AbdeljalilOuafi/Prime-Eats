import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsConditions() {
  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8">Terms & Conditions</h1>
        <p className="text-gray-800 text-lg mb-8 text-center font-medium">
          Welcome to PrimeEats. These Terms and Conditions govern your use of our website and services. 
          By accessing or using PrimeEats, you agree to be bound by these terms. Please read them carefully.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Definitions</h2>
        <p className="text-gray-800 mb-4">
          • "Website" refers to the PrimeEats website and services<br />
          • "User" refers to any person who accesses or uses the Website<br />
          • "Restaurant Partner" refers to food establishments registered on our platform<br />
          • "Content" refers to all information, text, graphics, and materials on the Website
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Website Usage</h2>
        <p className="text-gray-800 mb-4">
          2.1. You must be at least 18 years old to use our services.<br /><br />
          2.2. You agree to provide accurate, current, and complete information during registration.<br /><br />
          2.3. You are responsible for maintaining the confidentiality of your account credentials.<br /><br />
          2.4. You agree not to:<br />
          • Use the website for any illegal purposes<br />
          • Impersonate any person or entity<br />
          • Interfere with the website's functionality<br />
          • Submit false or misleading information<br />
          • Attempt to gain unauthorized access to our systems
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Ordering and Delivery</h2>
        <p className="text-gray-800 mb-4">
          3.1. Orders are subject to restaurant acceptance and availability.<br /><br />
          3.2. Delivery times are estimates and may vary based on circumstances.<br /><br />
          3.3. Minimum order values may apply and vary by restaurant.<br /><br />
          3.4. You agree to provide accurate delivery information and be present at the delivery location.<br /><br />
          3.5. Risk in the goods passes to you upon delivery.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Pricing and Payment</h2>
        <p className="text-gray-800 mb-4">
          4.1. All prices include applicable taxes unless stated otherwise.<br /><br />
          4.2. We reserve the right to change prices at any time.<br /><br />
          4.3. Payment is processed securely through our website.<br /><br />
          4.4. You agree to pay all charges at the prices specified, including delivery fees and gratuities.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cancellations and Refunds</h2>
        <p className="text-gray-800 mb-4">
          5.1. Orders can be cancelled through our website before restaurant acceptance.<br /><br />
          5.2. Refunds may be issued in cases of:<br />
          • Order cancellation before restaurant acceptance<br />
          • Significant delivery delays<br />
          • Quality issues with delivered items<br />
          • Missing items<br /><br />
          5.3. Refund processing times vary by payment method.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Website Content and Intellectual Property</h2>
        <p className="text-gray-800 mb-4">
          6.1. All website content is owned by PrimeEats or licensed to us.<br /><br />
          6.2. You may not use, copy, or distribute our content without permission.<br /><br />
          6.3. All trademarks, logos, and service marks are proprietary.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Privacy and Data Protection</h2>
        <p className="text-gray-800 mb-4">
          7.1. We collect and process personal data as described in our Privacy Policy.<br /><br />
          7.2. You consent to the collection and use of your data when using our website.<br /><br />
          7.3. We implement appropriate security measures to protect your data.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Liability and Indemnification</h2>
        <p className="text-gray-800 mb-4">
          8.1. We provide the website "as is" without warranties of any kind.<br /><br />
          8.2. We are not liable for any indirect or consequential damages.<br /><br />
          8.3. You agree to indemnify us against any claims arising from your use of the website.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Modifications to Terms</h2>
        <p className="text-gray-800 mb-4">
          9.1. We reserve the right to modify these terms at any time.<br /><br />
          9.2. Changes will be effective immediately upon posting.<br /><br />
          9.3. Continued use of the website constitutes acceptance of modified terms.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-md mt-16">
          <p className="font-bold text-lg text-center">
            For questions about these terms or our services, please
            <Link to="/contactPage" className="text-orange-500 relative group inline-block ml-2">
              <span className="relative z-10">contact us</span>
              <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-orange-500 transform scale-x-0 transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
            </Link>
          </p>
          <p className="text-gray-600 text-center mt-4">
            Last updated: January 16, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
