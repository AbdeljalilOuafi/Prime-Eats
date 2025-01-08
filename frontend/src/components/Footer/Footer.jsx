import { NavLink, Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#1a202c] text-gray-300 mt-[15%] mb-0">
      {/* Curved top shape */}
      <div className="absolute -top-24 left-0 w-full overflow-hidden">
        <svg    
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-24"
          fill="#1a202c"
        >
          <path
            d="M0,0 C300,60 900,60 1200,0 L1200,120 L0,120 Z"
          /> 
        </svg>
      </div>

      {/* Footer content */}
      <div className="container mx-auto pt-4 pb-8">
        {/* <div className="flex justify-around gap-4">
          <div className="relative bottom-20 mt-4 text-xl sm:text-2xl font-bold text-yellow-500">
            PrimeEats
          </div>
        </div> */}
        <div className="flex justify-around gap-4">
          {/* Links of interest */}
          <div className="flex flex-col p-0 m-1.5">
            <h3 className="text-lg font-semibold mb-4">Links of interest</h3>
            <ul className="space-y-4">
              <li>
                <NavLink
                  to="/aboutPage"
                  target="_blank"
                  className="hover:text-white relative group"
                >
                    <span>About us</span>
                    <span className="absolute right-0 left-0 top-6 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </NavLink>
              </li>
              <li>
                <NavLink
                   to="/FAQPage"
                   target="_blank"
                   className="hover:text-white relative group"
                   >
                    <span>FAQ</span>
                    <span className="absolute right-0 left-0 top-6 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </NavLink>
              </li>
              <li>
                <NavLink
                    to="/ContactPage"
                    target="_blank"
                    className="hover:text-white relative group"
                >
                      <span>Contact us</span>
                      <span className="absolute right-0 left-0 top-6 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Follow us */}
          <div className="mr-5 p-0">
            <h3 className="text-lg font-semibold mb-4 relative">Follow us</h3>
            <ul className="space-y-4">
              <li>
                <a 
                    href="https://github.com/AbdeljalilOuafi/Prime-Eats"
                    target="_blank" 
                    className="flex items-center hover:text-white relative group"
                  >
                    <FaFacebookF className="mr-2 text-sm sm:text-lg" />
                    <span>Facebook</span>
                    <span className="absolute right-0 left-0 bottom-0 top-7 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </a>
              </li>
              <li>
                <a 
                    href="https://github.com/AbdeljalilOuafi/Prime-Eats" 
                    target="_blank" 
                    className="flex items-center hover:text-white relative group">
                      <FaTwitter className="mr-2" />
                      <span>Twitter</span>
                      <span className="absolute right-5 left-0 bottom-0 top-7 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </a>
              </li>
              <li>
                <a 
                    href="https://github.com/AbdeljalilOuafi/Prime-Eats" 
                    target="_blank" 
                    className="flex items-center hover:text-white relative group">
                      <FaInstagram className="mr-2" />
                      <span>Instagram</span>
                      <span className="absolute right-0 left-0 bottom-0 top-7 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </a>
              </li>
              <li>
                <a 
                    href="https://github.com/AbdeljalilOuafi/Prime-Eats" 
                    target="_blank"
                    className="flex items-center hover:text-white relative group">
                      <FaLinkedinIn className="mr-2" />
                      <span>Linkedin</span>
                      <span className="absolute right-2 left-0 bottom-0 top-7 h-0.5 scale-x-0 bg-white transform trasition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-4">
              <li>
                <NavLink
                  to="/Terms & Conditions"
                  target="_blank"
                  className="hover:text-white relative group">
                    <span>Terms & Conditions</span>
                    <span className="absolute left-0 right-0 top-6 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </NavLink></li>
              <li>
                <NavLink
                    to="/Privacy Policy"
                    target="_blank"
                    className="hover:text-white relative group">
                    <span>Privacy Policy</span>
                    <span className="absolute right-0 left-0 top-6 h-0.5 bg-white scale-x-0 transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/Cookies Policy"
                  target="_blank"
                  className="hover:text-white relative group">
                    <span>Cookies Policy</span>
                    <span className="absolute right-0 left-0 top-6 h-0.5 scale-x-0 bg-white transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center ">
            © {new Date().getFullYear()} PrimeEats. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
