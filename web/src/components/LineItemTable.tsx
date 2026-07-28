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

      <div className="line-item-table__container">
        <table className="line-item-table__grid">
          <thead>
            <tr>
              <th className="line-item-table__head-cell">Description</th>
              <th className="line-item-table__head-cell line-item-table__head-cell--right">Quantity</th>
              <th className="line-item-table__head-cell line-item-table__head-cell--right">Rate</th>
              <th className="line-item-table__head-cell line-item-table__head-cell--right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr key={`${item.description}-${i}`} className="line-item-table__row">
                <td className="line-item-table__cell line-item-table__cell--desc">
                  <span className="line-item-table__desc-name">{item.description}</span>
                </td>
                <td className="line-item-table__cell line-item-table__cell--right line-item-table__cell--numeric">
                  {formatQuantity(item.quantity)}
                </td>
                <td className="line-item-table__cell line-item-table__cell--right line-item-table__cell--numeric">
                  {formatCurrency(item.rate, currency)}
                </td>
                <td className="line-item-table__cell line-item-table__cell--right line-item-table__cell--amount">
                  {formatCurrency(item.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="line-item-table__footer-row">
              <td className="line-item-table__cell line-item-table__cell--footer-label" colSpan={3}>Subtotal</td>
              <td className="line-item-table__cell line-item-table__cell--right line-item-table__cell--numeric">
                {formatCurrency(subtotal, currency)}
              </td>
            </tr>
            <tr className="line-item-table__footer-row">
              <td className="line-item-table__cell line-item-table__cell--footer-label" colSpan={3}>Tax</td>
              <td className="line-item-table__cell line-item-table__cell--right line-item-table__cell--numeric">
                {formatCurrency(tax, currency)}
              </td>
            </tr>
            <tr className="line-item-table__footer-row line-item-table__footer-row--total">
              <td className="line-item-table__cell line-item-table__cell--footer-total" colSpan={3}>Total due</td>
              <td className="line-item-table__cell line-item-table__cell--right line-item-table__cell--total">
                {formatCurrency(total, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
