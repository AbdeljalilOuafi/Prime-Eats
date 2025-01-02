import React from 'react';
import { NavLink } from 'react-router-dom';

export default function TermsConditions() {
    return (
        <div className="bg-gray-50 py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-5xl font-bold text-center mb-8">Terms & Conditions</h1>
                <p className="text-gray-800 text-lg mb-4 text-center">
                    Welcome to PrimeEats. By using our platform, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-800 mb-4">
                    By accessing our platform, you agree to be bound by these terms and conditions. If you do not agree to these terms and conditions, please do not use our platform.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of the Platform</h2>
                <p className="text-gray-800 mb-4">
                    You agree to use the platform only for purposes that are permitted by these terms and conditions. You agree not to use the platform for any unlawful purpose.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Intellectual Property</h2>
                <p className="text-gray-800 mb-4">
                    All content on the platform is the property of PrimeEats. You may not use any content from the platform without our written consent.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
                <p className="text-gray-800 mb-4">
                    PrimeEats is not responsible for any damages that may result from the use of our platform.
                </p>

                <h2 className="text-2xl font-semibold mb-4 mt-8">5. Governing Law</h2>
                <p className="text-gray-800 mb-4">
                    These terms and conditions are governed by the laws of the United States.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to Terms and Conditions</h2>
                <p className="text-gray-800 mb-4">
                    PrimeEats reserves the right to change these terms and conditions at any time. Please review them regularly.
                </p>

                <p className="bg-white font-bold text-lg mt-16 text-center">
                    If you have any questions about these terms and conditions, please contact us at
                    <NavLink
                        to="/ContactPage"
                        target="_blank"
                        className="text-yellow-500 relative group"
                    >
                        <span className="relative z-10 ml-3">Contact us</span>
                        <span className="absolute left-3 right-0 bottom-0 h-0.5 bg-yellow-500 transform scale-x-0 transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                    </NavLink>
                </p>
            </div>
        </div>
    )
}
