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
  const [sending, setSending] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceId || sending || !emailInput.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/invoice/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      if (!res.ok) {
        show('error', "We couldn't send the email right now. Please try again in a moment.");
        return;
      }

      show('success', 'Invoice sent! Check your inbox.');
      setShowEmailField(false);
      setEmailInput('');
    } catch {
      show('error', 'Something went wrong while sending. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

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
          <span className="portal-header__brand">
            <span className="portal-header__logo">Kron</span>
            <span className="portal-header__sublogo">Billing</span>
          </span>
        </header>
        <main className="portal-main">
          <div className="portal__loading">
            <div className="portal__loading-dots">
              <span className="portal__loading-dot" />
              <span className="portal__loading-dot" />
              <span className="portal__loading-dot" />
            </div>
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
          <span className="portal-header__brand">
            <span className="portal-header__logo">Kron</span>
            <span className="portal-header__sublogo">Billing</span>
          </span>
        </header>
        <main className="portal-main">
          <div className="portal__error">
            <div className="portal__error-icon">!</div>
            <p className="portal__error-message">{state.message}</p>
            <div className="portal__error-action">
              <button
                className="portal__btn portal__btn--secondary"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
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
        <a href="/" className="portal-header__brand-link">
          <span className="portal-header__logo">Kron</span>
          <span className="portal-header__sublogo">Billing</span>
        </a>
        <span className="portal-header__meta">
          Invoice #{invoiceId?.slice(0, 8)}
        </span>
      </header>

      <main className="portal-main">
        <div className="portal__greeting portal__section">
          <p className="portal__greeting-text">
            {greeting()}, <strong>{customer.name.split(' ')[0]}</strong>
          </p>
          <p className="portal__greeting-sub">
            Here is your billing summary for{' '}
            {new Date(invoice.period.start).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </p>
        </div>

        <div className="portal__grid">
          <div className="portal__section portal__grid--full">
            <SummaryCard customer={customer} invoice={invoice} />
          </div>

          <div className="portal__section">
            <UsageChart data={usage.dailyCallCounts} />
          </div>

          <div className="portal__section">
            <LatencyStats stats={usage.latency} />
          </div>
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

        <div className="portal__actions">
          {showEmailField ? (
            <form className="portal__email-form" onSubmit={handleSendEmail}>
              <input
                type="email"
                className="portal__email-input"
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
                required
                disabled={sending}
              />
              <button
                type="submit"
                className="portal__btn portal__btn--primary"
                disabled={sending || !emailInput.trim()}
              >
                {sending ? (
                  <><span className="portal__btn-spinner" /> Sending...</>
                ) : (
                  'Send'
                )}
              </button>
              <button
                type="button"
                className="portal__btn portal__btn--secondary"
                onClick={() => {
                  setShowEmailField(false);
                  setEmailInput('');
                }}
                disabled={sending}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <button
                className="portal__btn portal__btn--secondary"
                onClick={() => setShowEmailField(true)}
                id="send-email"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email my invoice
              </button>
              <button
                className="portal__btn portal__btn--primary"
                onClick={handleDownloadPdf}
                disabled={downloading}
                id="download-pdf"
              >
                {downloading ? (
                  <>
                    <span className="portal__btn-spinner" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
