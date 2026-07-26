import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalPage } from './pages/PortalPage';

export function App() {
  return (
    <Routes>
      <Route path="/portal/:invoiceId" element={<PortalPage />} />
      <Route path="*" element={<Navigate to="/portal/demo" replace />} />
    </Routes>
  );
}
