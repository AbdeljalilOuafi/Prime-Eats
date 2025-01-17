import { Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'support@primeeats.live',
      link: 'mailto:support@primeeats.live'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
        <div className="space-y-6">
          {contactDetails.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <item.icon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                {item.link ? (
                  <a
                    href={item.link}
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {item.content}
                  </a>
                ) : (
                  <p className="text-gray-600">{item.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Follow Us</h2>
        <div className="flex gap-4">
          <a href="https://github.com/AbdeljalilOuafi/Prime-Eats" target="_blank" className="p-3 bg-gray-100 rounded-lg hover:bg-orange-100 transition-colors">
            <FaFacebook className="w-6 h-6 text-gray-600" />
          </a>
          <a href="https://github.com/AbdeljalilOuafi/Prime-Eats" target="_blank" className="p-3 bg-gray-100 rounded-lg hover:bg-orange-100 transition-colors">
            <FaTwitter className="w-6 h-6 text-gray-600" />
          </a>
          <a href="https://github.com/AbdeljalilOuafi/Prime-Eats" target="_blank" className="p-3 bg-gray-100 rounded-lg hover:bg-orange-100 transition-colors">
            <FaInstagram className="w-6 h-6 text-gray-600" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
