
import { Link } from "react-router-dom"
export default function CookiesPolicy() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 mt-24">Cookies Policy</h1>
        <p className="text-gray-600 mb-6">
          Effective Date: January 1, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            1. What Are Cookies?
          </h2>
          <p className="text-gray-600">
            Cookies are small text files that are stored on your device when you visit a website. They help the website recognize your device and remember information about your preferences or past actions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            2. How We Use Cookies
          </h2>
          <p className="text-gray-600">
            We use cookies to improve your experience on our platform by:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Enabling essential website functionality.</li>
            <li>Remembering your preferences and settings.</li>
            <li>Analyzing website traffic and usage patterns.</li>
            <li>Delivering personalized content and advertisements.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            3. Types of Cookies We Use
          </h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>
              <strong>Essential Cookies:</strong> Necessary for the website to function properly.
            </li>
            <li>
              <strong>Performance Cookies:</strong> Help us understand how users interact with our site.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Remember your preferences to provide a better user experience.
            </li>
            <li>
              <strong>Advertising Cookies:</strong> Deliver personalized ads based on your browsing activity.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            4. Managing Cookies
          </h2>
          <p className="text-gray-600">
            You can manage or disable cookies through your browser settings. However, disabling certain cookies may impact your experience on our platform.
          </p>
          <p className="text-gray-600 mt-2">
            Here are links to manage cookies for popular browsers:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" className="text-orange-500 underline" target="_blank" rel="noopener noreferrer">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="text-orange-500 underline" target="_blank" rel="noopener noreferrer">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/en-us/HT201265" className="text-orange-500 underline" target="_blank" rel="noopener noreferrer">
                Safari
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/en-us/topic/how-to-manage-cookies-in-internet-explorer-9-6e4e4f64-a7d4-78e3-e3b0-a6a0cde4e1e8" className="text-orange-500 underline" target="_blank" rel="noopener noreferrer">
                Internet Explorer/Edge
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            5. Third-Party Cookies
          </h2>
          <p className="text-gray-600">
            Some cookies on our website are set by third parties, such as analytics providers and advertisers. These cookies are governed by the privacy policies of the respective third parties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            6. Updates to This Cookies Policy
          </h2>
          <p className="text-gray-600">
            We may update this Cookies Policy from time to time to reflect changes in our practices or legal requirements. Please revisit this page periodically for any updates.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            7. Contact Us
          </h2>
          <p className="text-gray-600">

            If you have any questions about this Cookies Policy, please 
            <Link to="/ContactPage"
              className="text-orange-500 relative group"
            >
              <span className="relative z-10 ml-1.5">Contact us</span>
              <span className="absolute right-0 left-1.5 bottom-0 h-0.5 bg-orange-500 scale-x-0 transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
            </Link>
          </p>
        </section>

        <p className="text-gray-500 text-sm mt-4">
          By using our services, you consent to the use of cookies as outlined in this policy.
        </p>
      </div>
    </div>
  );
};

