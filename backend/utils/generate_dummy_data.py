    def _generate_dummy_restaurants(self, city, base_latitude, base_longitude, count=20):
        """
        Generate dummy restaurants using Faker
        """
        dummy_restaurants = []
        cuisine_types = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Fast Food', 'Vegan', 'Burger', 'Sushi']

        for _ in range(count):
            # Generate nearby coordinates
            lat_offset = random.uniform(-0.05, 0.05)
            lon_offset = random.uniform(-0.05, 0.05)

            dummy_restaurant = {
                'name': self.faker.company(),
                'address': self.faker.address(),
                'latitude': base_latitude + lat_offset,
                'longitude': base_longitude + lon_offset,
                'rating': round(random.uniform(1.0, 5.0), 1),
                'total_ratings': random.randint(10, 500),
                'cuisine_type': random.choice(cuisine_types),
                'city': city
            }
            dummy_restaurants.append(dummy_restaurant)

        return dummy_restaurants
