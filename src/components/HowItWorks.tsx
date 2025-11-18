import { UserPlus, Search, Play } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your account in seconds with our streamlined registration process.'
    },
    {
      icon: Search,
      title: 'Discover',
      description: 'Browse our vast library or let AI recommend content tailored to your taste.'
    },
    {
      icon: Play,
      title: 'Stream & Enjoy',
      description: 'Watch unlimited content in stunning quality across all your devices.'
    }
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">How It</span>{' '}
            <span className="text-yellow-400 glow-text">Works</span>
          </h2>
          <p className="text-xl text-gray-300">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
            <div className="flex justify-between">
              <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
            </div>
          </div>

          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-bold text-xl rounded-full mb-6 glow-circle">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-6">
                <div className="inline-flex p-4 bg-gray-900/50 border border-gray-800 rounded-xl group-hover:border-yellow-400/50 transition-all duration-300">
                  <step.icon className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-yellow-400 transition-colors duration-300">
                {step.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;