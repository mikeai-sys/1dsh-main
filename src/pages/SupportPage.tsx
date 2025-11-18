import React from 'react';
import { ArrowLeft, Mail, MessageCircle, Phone, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          <h1 className="text-xl font-bold text-white">{t('support_center')}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">{t('support_title')}</span>{' '}
            <span className="text-yellow-400 glow-text">help you?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('support_subtitle')}
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('email_support')}</h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('email_support_desc')}
            </p>
            <button
              onClick={() => handleExternalLink('mailto:support@deltasilicon.hub')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
            >
              support@deltasilicon.hub
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('live_chat')}</h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('live_chat_desc')}
            </p>
            <button
              onClick={() => handleExternalLink('https://discord.gg/deltasilicon')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
            >
              {t('start_chat')}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <Phone className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('phone_support')}</h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('phone_support_desc')}
            </p>
            <button
              onClick={() => handleExternalLink('tel:+1-800-DELTA-HUB')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
            >
              +1-800-DELTA-HUB
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">{t('faq_title')}</h3>
          <div className="space-y-4">
            {[
              { question: t('faq_q1'), answer: t('faq_a1') },
              { question: t('faq_q2'), answer: t('faq_a2') },
              { question: t('faq_q3'), answer: t('faq_a3') },
              { question: t('faq_q4'), answer: t('faq_a4') }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-2">{faq.question}</h4>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">{t('support_hours_title')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">{t('support_hours_weekdays')}</div>
              <div className="text-white">{t('support_hours_weekdays_time')}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">{t('support_hours_weekend')}</div>
              <div className="text-white">{t('support_hours_weekend_time')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;