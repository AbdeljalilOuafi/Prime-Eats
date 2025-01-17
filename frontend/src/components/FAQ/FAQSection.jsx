import React from 'react';
import FAQItem from './FAQItem';
import ContactPage from '../Contact/ContactPage';
import { Link } from 'react-router-dom'

const faqs = [
  {
    question: "How does PrimeEats delivery work?",
    answer: "Simply browse restaurants in your area, place your order, and track your delivery in real-time. Our drivers will bring your food directly to your doorstep."
  },
  {
    question: "What are the delivery fees?",
    answer: "Delivery fees vary based on the distance between the restaurants and the delivery address. For nearby areas, the charges may be minimal, while longer distances might incur higher fees."
  },
  {
    question: "How long does delivery take?",
    answer: "Typical delivery times range from 20-45 minutes depending on distance and order volume. You'll see an estimated delivery time before placing your order."
  },
  {
    question: "What if there's an issue with my order?",
    answer: "Our customer service team is available 24/7. You can report any issues through the website, and we'll make it right immediately."
  },
  {
    question: "Do you have a minimum order amount?",
    answer: "Minimum order amounts vary by restaurant. The minimum amount will be clearly displayed before you place your order."
  },
];

export default function FAQSection() {
  return (
    <div className="py-16 bg-gray-50 mt-24">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-600 text-center mb-12">
        Have questions? We're here with the answers you need
        </p>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
          <p className="flex items-center text-center">if you have another questions can be click at  
            <Link to="/ContactPage"
              className="text-orange-500 relative group"
            >
              <span className="relative z-10 ml-1.5">Contact us</span>
              <span className="absolute right-0 left-1.5 bottom-0 h-0.5 bg-orange-500 scale-x-0 transform transition-transform duration-700 ease-in-out group-hover:scale-x-100"></span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
