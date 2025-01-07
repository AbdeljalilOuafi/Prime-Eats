import React from 'react';
import FAQItem from './FAQItem';

const faqs = [
  {
    question: "How does PrimeEats delivery work?",
    answer: "Simply browse restaurants in your area, place your order, and track your delivery in real-time. Our drivers will bring your food directly to your doorstep."
  },
  {
    question: "What are the delivery fees?",
    answer: "Delivery is free for all orders, with no additional charges."
  },
  {
    question: "How long does delivery take?",
    answer: "Typical delivery times range from 20-45 minutes depending on distance and order volume. You'll see an estimated delivery time before placing your order."
  },
  {
    question: "What if there's an issue with my order?",
    answer: "Our customer service team is available 24/7. You can report any issues through the app or website, and we'll make it right immediately."
  },
  {
    question: "Do you have a minimum order amount?",
    answer: "Minimum order amounts vary by restaurant. The minimum amount will be clearly displayed before you place your order."
  },
  {
    question: "Can I schedule an order in advance?",
    answer: "Yes! You can schedule orders up to 7 days in advance. Simply select your preferred delivery date and time during checkout."
  }
];

export default function FAQSection() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-600 text-center mb-12">
          Got questions? We've got answers.
        </p>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};
