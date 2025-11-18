import { Zap, Shield, Brain, Download, Smartphone, Crown } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'Unlimited HD Streaming',
      description: 'Stream in stunning 4K quality without any bandwidth limits or restrictions.'
    },
    {
      icon: Shield,
      title: 'No Ads, Ever',
      description: 'Enjoy uninterrupted entertainment with our completely ad-free experience.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      description: 'Discover new favorites with our intelligent recommendation engine.'
    },
    {
      icon: Download,
      title: 'Offline Downloads',
      description: 'Download content to watch anywhere, anytime, even without internet.'
    },
    {
      icon: Smartphone,
      title: 'Cross-Device Sync',
      description: 'Start watching on one device and continue seamlessly on another.'
    },
    {
      icon: Crown,
      title: 'Premium Content',
      description: 'Access exclusive shows and movies available only on DeltaSilicon.Hub.'
    }
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Why Choose</span>{' '}
            <span className="text-yellow-400 glow-text">DeltaSilicon.Hub</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience streaming like never before with features designed for the future of entertainment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-yellow-400/50 transition-all duration-300 backdrop-blur-sm hover:bg-gray-900/70 feature-card"
            >
              <div className="mb-6">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-yellow-400 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;