import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import MovieCarousel from '../components/MovieCarousel';
import MovieCategories from '../components/MovieCategories';
import MovieSearch from '../components/MovieSearch';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import About from '../components/About';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero onWatchNow={navigateToDashboard} />
      <Features />
      <MovieCarousel onWatchMovie={navigateToDashboard} />
      <MovieCategories onWatchMovie={navigateToDashboard} />
      <MovieSearch onWatchMovie={navigateToDashboard} />
      <HowItWorks />
      <FAQ />
      <About />
      <Footer />
    </div>
  );
};

export default Home;