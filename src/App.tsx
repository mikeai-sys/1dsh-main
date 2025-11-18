import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import WatchMovie from './pages/WatchMovie';
import WatchSeries from './pages/WatchSeries';
import ContentInfoPage from './pages/ContentInfoPage';
import ActorPage from './pages/ActorPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import AnimePage from './pages/AnimePage';
import HistoryPage from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import OfficialUpdatesPage from './pages/OfficialUpdatesPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import CountryMoviesPage from './pages/CountryMoviesPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<MoviesPage />} />
              <Route path="series" element={<SeriesPage />} />
              <Route path="anime" element={<AnimePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="country" element={<CountryMoviesPage />} />
            </Route>
            <Route path="/movie/watch/:movieId" element={<WatchMovie />} />
            <Route path="/series/watch/:seriesId/:season/:episode" element={<WatchSeries />} />
            <Route path="/movie/:id/:title" element={<ContentInfoPage contentType="movie" />} />
            <Route path="/series/:id/:title" element={<ContentInfoPage contentType="series" />} />
            <Route path="/actor/:actorId" element={<ActorPage />} />
            <Route path="/updates" element={<OfficialUpdatesPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;