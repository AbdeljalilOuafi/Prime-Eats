# PrimeEats 🌍

> An international food delivery platform that connects customers with restaurants worldwide.

## Description 📝
PrimeEats is an international food delivery platform that connects customers with local restaurants within their specific zones, ensuring a seamless and localized dining experience. Our platform enables users to discover and order from a variety of eateries in their vicinity, promoting local businesses and delivering fresh meals promptly.

## Key Features
- Users can view and order from restaurants within their designated delivery zones, ensuring timely deliveries and supporting local economies.
- Customers can track their orders in real-time, from preparation to delivery, enhancing transparency and trust.
- Our intuitive design makes it easy for users to browse menus, customize orders, and make secure payments.

## Tech Stack 🛠️

### Backend
- Python 3.13.1
- Django (REST Framework)
- MySQL Database

### Frontend
- React.js
- Vite
- Axios

### Authentication
- Clerk

## Prerequisites 📋
To run this project, you need:
- Python 3.13.1
- Node.js & npm
- MySQL server
- Vite

## Installation 💻

1. Clone the repository
```bash
git clone https://github.com/AbdeljalilOuafi/Prime-Eats
cd Prime-Eats
```

2. Backend setup
```bash
# Create virtual environment
python -m venv venv
```

# Activate virtual environment
# On Windows
```
.\\venv\\Scripts\\activate
```
# On Unix or MacOS
```
source venv/bin/activate
```

# Install dependencies
```bash
pip install -r requirements.txt
```

# Run migrations
```bash
python manage.py migrate
```

# Start server
```bash
python manage.py runserver
```

3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## Team 👥
- Badr Bouzagui
- Abdeljalil Ouafi
- Hakim Joulal
- Soukaina Megdani

## Future Features 🚀
- Mobile application (iOS & Android)
- Multi-language support
- Advanced restaurant management system

## Deployment 🌐
PrimeEats is now live and accessible at https://www.primeeats.live. Our platform is hosted on a robust infrastructure to ensure high availability and performance for our users. We have implemented best practices for site deployment and hosting, including the use of deployment slots for zero-downtime deployments and automated monitoring to ensure the site remains operational 24/7.

## License 📄
This project is MIT licensed.

---
Made with ❤️ by the Students in ALX SE
