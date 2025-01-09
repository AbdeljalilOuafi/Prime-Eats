const ServiceIntro = () => {
    return (
      <section className="py-16 px-4 m-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 bg-white/50 backdrop-blur-sm p-6 rounded-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Food delivery made simple
              </h2>
              <p className="text-lg text-gray-600">
                Order from your favorite restaurants and get food delivered right to your doorstep. 
                Browse menus, customize your orders, and track your delivery in real-time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-100/50 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-xl mb-2">Wide Selection</h3>
                <p className="text-gray-600">Choose from thousands of restaurants</p>
              </div>
              <div className="bg-blue-100/50 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Get your food delivered in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default ServiceIntro;