import type { LineItem } from '../api/client';
import './LineItemTable.css';

type Props = {
  items: LineItem[];
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatQuantity(qty: number): string {
  return qty.toLocaleString('en-US');
}

export function LineItemTable({ items, currency, subtotal, tax, total }: Props) {
  return (
    <section className="line-item-table" id="line-item-table">
      <p className="line-item-table__title">Invoice details</p>

      <table className="line-item-table__grid">
        <thead>
          <tr>
            <th className="line-item-table__head-cell">Item</th>
            <th className="line-item-table__head-cell line-item-table__head-cell--right line-item-table__head-cell--hide-mobile">Qty</th>
            <th className="line-item-table__head-cell line-item-table__head-cell--right line-item-table__head-cell--hide-mobile">Rate</th>
            <th className="line-item-table__head-cell line-item-table__head-cell--right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.description}>
              <td className="line-item-table__cell">{item.description}</td>
              <td className="line-item-table__cell line-item-table__cell--secondary line-item-table__cell--right line-item-table__cell--hide-mobile">
                {formatQuantity(item.quantity)}
              </td>
              <td className="line-item-table__cell line-item-table__cell--secondary line-item-table__cell--right line-item-table__cell--hide-mobile">
                {formatCurrency(item.rate, currency)}
              </td>
              <td className="line-item-table__cell line-item-table__cell--right">
                {formatCurrency(item.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="line-item-table__footer-row">
            <td className="line-item-table__cell line-item-table__cell--secondary" colSpan={3}>Subtotal</td>
            <td className="line-item-table__cell line-item-table__cell--right">{formatCurrency(subtotal, currency)}</td>
          </tr>
          <tr className="line-item-table__footer-row">
            <td className="line-item-table__cell line-item-table__cell--secondary" colSpan={3}>Tax</td>
            <td className="line-item-table__cell line-item-table__cell--right">{formatCurrency(tax, currency)}</td>
          </tr>
          <tr className="line-item-table__footer-row line-item-table__footer-row--total">
            <td className="line-item-table__cell" colSpan={3}>Total</td>
            <td className="line-item-table__cell line-item-table__cell--right">{formatCurrency(total, currency)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
