import React from 'react';
import { ArrowLeft } from 'lucide-react';
import About from '../components/About';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <h1 className="text-xl font-bold text-white">About Us</h1>
        </div>
      </div>
      <About />
      <Footer />
    </div>
  );
};

export default AboutPage;