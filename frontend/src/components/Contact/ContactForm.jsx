import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate a successful response
      const fakeResponse = { status: 200 };

      if (fakeResponse.status === 200) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center animate-bounce">
          <h2 className="text-4xl font-extrabold text-green-500">Thank you!</h2>
          <p className="mt-2 text-gray-700">Your message has been received.</p>
          <p className="mt-1 text-sm text-gray-500">We'll respond shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? 'Sending...' : 'Send Message'}
          <Send size="24" />
        </button>
      </form>
    </div>
  );
};
