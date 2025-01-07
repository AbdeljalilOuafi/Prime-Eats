import React from 'react';

const stats = [
  { number: '500', label: 'Restaurant Partners' },
  { number: '999+', label: 'Happy Customers' },
  { number: '999+', label: 'Deliveries Made' },
  { number: 'Global', label: 'Cities Served' }
];

export default function StatsSection() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
