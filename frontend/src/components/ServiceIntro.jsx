import { motion } from 'framer-motion';
import { Utensils, Truck, Clock } from 'lucide-react';

const ServiceIntro = () => {
  const features = [
    { icon: Utensils, title: 'Wide Selection', description: 'Choose from thousands of restaurants' },
    { icon: Truck, title: 'Fast Delivery', description: 'Get your food delivered in minutes' },
    { icon: Clock, title: '24/7 Service', description: 'Order anytime, day or night' },
  ];

  return (
    <motion.section 
      className="py-16 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Food delivery made simple
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Order from your favorite restaurants and get food delivered right to your doorstep. 
            Browse menus, customize your orders, and track your delivery in real-time.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
            >
              <feature.icon className="w-12 h-12 text-orange-500 mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ServiceIntro;

