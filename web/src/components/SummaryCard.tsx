import type { Customer, InvoiceData } from '../api/client';
import './SummaryCard.css';

type Props = {
  customer: Customer;
  invoice: InvoiceData;
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function splitCurrency(formatted: string): { whole: string; cents: string } {
  const dotIndex = formatted.lastIndexOf('.');
  if (dotIndex === -1) return { whole: formatted, cents: '' };
  return {
    whole: formatted.slice(0, dotIndex),
    cents: formatted.slice(dotIndex),
  };
}

export function SummaryCard({ customer, invoice }: Props) {
  const formatted = formatCurrency(invoice.total, invoice.currency);
  const { whole, cents } = splitCurrency(formatted);

  return (
    <section className="summary-card" id="summary-card">
      <div className="summary-card__bg" />
      <div className="summary-card__glow" />

      <div className="summary-card__top">
        <div className="summary-card__info">
          <p className="summary-card__label">Total charged</p>
          <p className="summary-card__total">
            {whole}
            <span className="summary-card__total-cents">{cents}</span>
          </p>
        </div>
        <div className="summary-card__meta">
          <span className="summary-card__badge">
            {invoice.currency.toUpperCase()}
          </span>
          <span className="summary-card__period">
            {formatDate(invoice.period.start)} &ndash; {formatDate(invoice.period.end)}
          </span>
        </div>
      </div>

      <div className="summary-card__divider" />

      <div className="summary-card__bottom">
        <div className="summary-card__detail">
          <p className="summary-card__detail-label">Customer</p>
          <p className="summary-card__detail-value">{customer.name}</p>
          <p className="summary-card__detail-meta">{customer.email}</p>
        </div>
        <div className="summary-card__detail">
          <p className="summary-card__detail-label">Account</p>
          <p className="summary-card__detail-value">
            {customer.accountId.slice(0, 8)}
          </p>
          <p className="summary-card__detail-meta">{invoice.id.slice(0, 8)}</p>
        </div>
        <div className="summary-card__detail">
          <p className="summary-card__detail-label">Invoice</p>
          <p className="summary-card__detail-value">#{invoice.id.slice(0, 8)}</p>
          <p className="summary-card__detail-meta">
            {formatDate(invoice.period.start)}
          </p>
        </div>
      </div>
    </section>
  );
}
