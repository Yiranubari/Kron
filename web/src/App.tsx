import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PortalPage } from './pages/PortalPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/portal/:invoiceId" element={<PortalPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
