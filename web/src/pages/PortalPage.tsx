import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInvoiceData } from '../hooks/useInvoiceData';
import { useToast } from '../hooks/useToast';
import { SummaryCard } from '../components/SummaryCard';
import { UsageChart } from '../components/UsageChart';
import { LineItemTable } from '../components/LineItemTable';
import { LatencyStats } from '../components/LatencyStats';
import { ToastContainer } from '../components/Toast';
import './PortalPage.css';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function PortalPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const state = useInvoiceData(invoiceId);
  const { toasts, show, dismiss } = useToast();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    if (!invoiceId || downloading) return;

    setDownloading(true);
    try {
      const res = await fetch(`/invoice/${invoiceId}/pdf`);

      if (!res.ok) {
        show('error', "We couldn't generate your PDF right now. Please try again in a moment.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      show('success', 'Your invoice PDF is downloading now.');
    } catch {
      show('error', 'Something went wrong while downloading. Please check your connection and try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="portal">
        <header className="portal-header">
          <span className="logo">Kron</span>
          <span className="logo-sub">Billing</span>
        </header>
        <main className="portal-main">
          <div className="portal__loading">
            <div className="portal__spinner" />
            <p className="portal__loading-text">Loading your invoice...</p>
          </div>
        </main>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="portal">
        <header className="portal-header">
          <span className="logo">Kron</span>
          <span className="logo-sub">Billing</span>
        </header>
        <main className="portal-main">
          <div className="portal__error">
            <span className="portal__error-icon">○</span>
            <p className="portal__error-message">{state.message}</p>
          </div>
        </main>
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    );
  }

  const { customer, invoice, usage } = state.data;

  return (
    <div className="portal">
      <header className="portal-header">
        <span className="logo">Kron</span>
        <span className="logo-sub">Billing</span>
      </header>

      <main className="portal-main">
        <div className="portal__greeting">
          <p className="portal__greeting-text">{greeting()}, {customer.name.split(' ')[0]}</p>
          <p className="portal__greeting-sub">Here is your billing summary</p>
        </div>

        <div className="portal__section">
          <SummaryCard customer={customer} invoice={invoice} />
        </div>

        <div className="portal__section">
          <UsageChart data={usage.dailyCallCounts} />
        </div>

        <div className="portal__section">
          <LineItemTable
            items={invoice.lineItems}
            currency={invoice.currency}
            subtotal={invoice.subtotal}
            tax={invoice.tax}
            total={invoice.total}
          />
        </div>

        <div className="portal__section">
          <LatencyStats stats={usage.latency} />
        </div>

        <div className="portal__actions">
          <button
            className="portal__btn portal__btn--secondary"
            onClick={handleDownloadPdf}
            disabled={downloading}
            id="download-pdf"
          >
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
