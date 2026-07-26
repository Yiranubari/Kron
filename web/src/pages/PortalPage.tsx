import { useParams } from 'react-router-dom';

export function PortalPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();

  return (
    <div className="portal">
      <header className="portal-header">
        <span className="logo">Kron</span>
        <span className="logo-sub">Billing</span>
      </header>
      <main className="portal-main">
        <p className="portal-loading">Loading invoice {invoiceId}...</p>
      </main>
    </div>
  );
}
