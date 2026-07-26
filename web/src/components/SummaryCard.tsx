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
      <div className="summary-card__header">
        <div>
          <p className="summary-card__label">Total charged</p>
          <p className="summary-card__total">
            {whole}
            <span className="summary-card__total-cents">{cents}</span>
          </p>
        </div>
        <span className="summary-card__badge">
          {invoice.currency.toUpperCase()}
        </span>
      </div>

      <div className="summary-card__divider" />

      <div className="summary-card__details">
        <div>
          <p className="summary-card__detail-label">Customer</p>
          <p className="summary-card__detail-value">{customer.name}</p>
          <p className="summary-card__detail-value">{customer.email}</p>
        </div>
        <div>
          <p className="summary-card__detail-label">Billing period</p>
          <p className="summary-card__detail-value">
            {formatDate(invoice.period.start)} &ndash; {formatDate(invoice.period.end)}
          </p>
        </div>
      </div>
    </section>
  );
}
