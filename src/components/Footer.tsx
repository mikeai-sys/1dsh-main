import { Sparkles, Mail, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-16 px-4 bg-gradient-to-t from-black via-gray-900 to-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400 glow-text">
                DeltaSilicon.Hub
              </span>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              The future of intelligent streaming. Experience entertainment without limits, 
              powered by AI and designed for you.
            </p>

            <div className="flex gap-4">
              <a 
                href="#" 
                className="p-3 bg-gray-800 hover:bg-yellow-400/10 border border-gray-700 hover:border-yellow-400/50 rounded-lg transition-all duration-300 group"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-gray-800 hover:bg-yellow-400/10 border border-gray-700 hover:border-yellow-400/50 rounded-lg transition-all duration-300 group"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-gray-800 hover:bg-yellow-400/10 border border-gray-700 hover:border-yellow-400/50 rounded-lg transition-all duration-300 group"
              >
                <Youtube className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-gray-800 hover:bg-yellow-400/10 border border-gray-700 hover:border-yellow-400/50 rounded-lg transition-all duration-300 group"
              >
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Downloads</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">System Requirements</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 DeltaSilicon.Hub. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
              Cookie Settings
            </a>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
              Legal
            </a>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;