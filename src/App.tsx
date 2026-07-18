import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { getSettings } from './lib/db';
import Splash from './routes/Splash';
import Onboarding from './routes/Onboarding';
import Home from './routes/Home';
import Setup from './routes/Setup';
import Game from './routes/Game';
import Result from './routes/Result';
import History from './routes/History';
import Player from './routes/Player';
import Settings from './routes/Settings';

function HomeGate() {
  const launched = localStorage.getItem('bust-launched');
  return launched ? <Home /> : <Navigate to="/splash" replace />;
}

export default function App() {
  const { theme, setSettings } = useAppStore();

  useEffect(() => {
    getSettings().then(s => setSettings(s));
  }, [setSettings]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<HomeGate />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/game" element={<Game />} />
      <Route path="/result" element={<Result />} />
      <Route path="/history" element={<History />} />
      <Route path="/player/:id" element={<Player />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
