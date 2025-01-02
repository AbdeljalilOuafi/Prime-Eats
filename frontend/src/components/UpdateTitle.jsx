import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function UpdateTitle() {
    const location = useLocation();

    useEffect(() => {
        const titles = {
            '/': 'PrimeEats - Home',
            '/aboutPage': 'PrimeEats - About',
            '/FAQPage': 'PrimeEats - FAQ',
            '/ContactPage': 'PrimeEats - Contact',
            '/Terms & Conditions': 'PrimeEats - Terms & Conditions',
            '/Privacy Policy': 'PrimeEats - Privacy Policy',
            'Cookies Policy': 'PrimeEats - Cookies Policy',
        }
        document.title = titles[location.pathname] || 'PrimeEats';
    }, [location]);
}
