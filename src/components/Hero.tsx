import React, { useState, useEffect } from 'react';
import { Play, Sparkles } from 'lucide-react';

interface HeroProps {
  onWatchNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ onWatchNow }) => {
  const [userCountry, setUserCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');

  useEffect(() => {
    // Get user's country using IP geolocation
    const getUserCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_name || 'your region');
        setCountryFlag(data.country_code?.toLowerCase() || '');
      } catch (error) {
        console.error('Error fetching country:', error);
        setUserCountry('your region');
      }
    };

    getUserCountry();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Country Flag Background */}
      {countryFlag && (
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://flagcdn.com/w1280/${countryFlag}.png)`
          }}
        ></div>
      )}
      
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-yellow-400/30 rounded-lg bg-black/50 backdrop-blur-sm glow-border">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl md:text-3xl font-bold text-yellow-400 glow-text">
              DeltaSilicon.Hub
            </span>
          </div>
        </div>

        {/* Availability Message */}
        <div className="mb-6">
          <p className="text-lg md:text-xl text-yellow-400 font-semibold glow-text">
            DSH is available now in {userCountry}!
          </p>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Stream</span>{' '}
          <span className="text-yellow-400 glow-text">Without</span>{' '}
          <span className="text-white">Limits</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Experience the future of entertainment with AI-powered recommendations, 
          zero ads, and unlimited HD streaming across all your devices.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onWatchNow}
            className="group relative px-8 py-4 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button"
          >
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Now
            </span>
          </button>
          
          <button className="px-8 py-4 border border-yellow-400/50 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400/10 transition-all duration-300 glow-border-hover">
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 glow-text">10K+</div>
            <div className="text-gray-400">Movies & Shows</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 glow-text">4K</div>
            <div className="text-gray-400">Ultra HD Quality</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 glow-text">0</div>
            <div className="text-gray-400">Ads Ever</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;