
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 mt-24">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">
          Effective Date: January 1, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            1. Introduction
          </h2>
          <p className="text-gray-600">
            Welcome to our platform! Your privacy is important to us, and we
            are committed to protecting the personal information you share with
            us. This Privacy Policy outlines how we collect, use, and safeguard
            your information when you use our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Personal Information: Name, email address, and contact details.</li>
            <li>Usage Data: Details about how you use our platform, including log data, IP address, and browser type.</li>
            <li>Cookies: Information stored to improve your browsing experience.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-600">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Provide and maintain our services.</li>
            <li>Improve user experience and personalize content.</li>
            <li>Communicate with you, including sending updates and promotional materials.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            4. Sharing Your Information
          </h2>
          <p className="text-gray-600">
            We do not share your personal information with third parties
            except:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>When required by law or legal process.</li>
            <li>To protect the rights and safety of our users and platform.</li>
            <li>With trusted partners for operational purposes (e.g., payment processing).</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            5. Your Rights
          </h2>
          <p className="text-gray-600">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Access, update, or delete your personal information.</li>
            <li>Withdraw consent for data processing at any time.</li>
            <li>Request a copy of the data we hold about you.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            6. Data Security
          </h2>
          <p className="text-gray-600">
            We implement industry-standard measures to protect your data.
            However, no method of transmission over the Internet is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            7. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. Any changes
            will be effective immediately upon posting, and we encourage you to
            review this page periodically.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            8. Contact Us
          </h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please
            us at 
            <Link 
            to="/ContactPage"
            className="text-orange-500 relative group"
            >
              <span className="relative z-10 ml-1.5">Contact us</span>
              <span className="absolute right-0 left-1.5 bottom-0 h-0.5 scale-x-0 bg-orange-500 transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
            </Link>
          </p>
        </section>

        <p className="text-gray-500 text-sm mt-4">
          By using our services, you consent to this Privacy Policy.
        </p>
      </div>
    </div>
  );
};
