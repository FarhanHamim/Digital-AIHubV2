import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-undp-dark-blue text-white">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div>
            <h3 className="text-base font-bold mb-1.5">UNDP Digital & AI Hub</h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              Enablers for designing people-centered digital transformation
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-1.5 text-sm">Quick Links</h4>
            <ul className="space-y-1 text-xs">
              <li><Link to="/initiatives" className="text-gray-300 hover:text-white">Initiatives</Link></li>
              <li><Link to="/learning" className="text-gray-300 hover:text-white">Learning & Capacity</Link></li>
              <li><Link to="/projects" className="text-gray-300 hover:text-white">Projects & Supports</Link></li>
              <li><Link to="/events" className="text-gray-300 hover:text-white">Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-1.5 text-sm">Contact</h4>
            <ul className="space-y-1 text-xs text-gray-300">
              <li className="flex items-center space-x-1.5">
                <Mail size={14} />
                <span>registry.bd@undp.org</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone size={14} />
                <span>+880 2 55667788</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>UN Offices, 18th Floor, IDB Bhaban, Agargaon, Sher-e-Bangla Nagar, Dhaka 1207, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-3 pb-2 text-center text-xs text-gray-300">
          <p>&copy; {new Date().getFullYear()} UNDP Digital & AI Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
