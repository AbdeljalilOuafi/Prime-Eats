import React from 'react';
import { Target, Heart, Clock } from 'lucide-react';
import { InteractiveGridPattern } from '../../components/ui/interactive-grid-pattern';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To make local food delivery accessible to everyone while supporting local businesses.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Quality, reliability, and exceptional service are at the heart of everything we do.',
  },
  {
    icon: Clock,
    title: 'Our Promise',
    description: 'Fast, reliable delivery and outstanding customer service, every single time.',
  },
];

const MissionSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 relative">
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="text-center bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default MissionSection;
