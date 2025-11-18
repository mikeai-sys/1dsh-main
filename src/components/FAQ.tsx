import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What devices are supported?',
      answer: 'DeltaSilicon.Hub works on all modern devices including smartphones, tablets, laptops, smart TVs, and gaming consoles. Our responsive web app ensures optimal viewing experience across all screen sizes.'
    },
    {
      question: 'Is there really no monthly subscription fee?',
      answer: 'We offer flexible pricing options including free tier with limited content and premium subscriptions with full access. No hidden fees, cancel anytime.'
    },
    {
      question: 'How does the AI recommendation system work?',
      answer: 'Our advanced AI analyzes your viewing patterns, preferences, and ratings to suggest content you\'ll love. The more you watch, the smarter our recommendations become.'
    },
    {
      question: 'Can I download content for offline viewing?',
      answer: 'Yes! Premium subscribers can download unlimited content to watch offline on mobile devices. Downloads are available for 30 days and can be renewed while connected to internet.'
    },
    {
      question: 'What video quality options are available?',
      answer: 'We support multiple quality options from 480p to 4K Ultra HD, automatically adjusting based on your internet connection for smooth streaming experience.'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Frequently Asked</span>{' '}
            <span className="text-yellow-400 glow-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about DeltaSilicon.Hub
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm"
            >
              <button
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors duration-300"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 border-t border-gray-700/50">
                  <p className="text-gray-300 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;