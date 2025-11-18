import { Target, Users, Zap } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">{t('about_prefix')}</span>{' '}
            <span className="text-yellow-400 glow-text">DeltaSilicon.Hub</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">
              {t('about_title')}
            </h3>
            
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {t('about_p1')}
            </p>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {t('about_p2')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg mb-3">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 glow-text">2024</div>
                <div className="text-sm text-gray-400">{t('founded')}</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg mb-3">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 glow-text">50K+</div>
                <div className="text-sm text-gray-400">{t('active_users')}</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg mb-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 glow-text">99.9%</div>
                <div className="text-sm text-gray-400">{t('uptime')}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
              <h4 className="text-2xl font-bold mb-6 text-yellow-400">{t('our_vision')}</h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{t('vision_1')}</p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{t('vision_2')}</p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{t('vision_3')}</p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{t('vision_4')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;