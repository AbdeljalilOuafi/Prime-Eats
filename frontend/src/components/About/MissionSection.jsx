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
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="fixed inset-0 bg-or pointer-events-auto">
            <InteractiveGridPattern
              className="absolute inset-0 w-full h-full [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
              width={20}
              height={20}
              squares={[80, 80]}
              squaresClassName="hover:fill-orange-500"
            />
          </div>
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
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
    </div>
  );
};

export default MissionSection;
