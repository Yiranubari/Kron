import { Html } from '@unlayer/react-elements';
import type { LineItem } from '../../invoice/entities/invoice.entity.js';

type Props = {
  items: LineItem[];
  currency: string;
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function LineItemTable({ items, currency }: Props) {
  const rowsHtml = items.map((item) => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb;">${item.description}</td>
      <td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatNumber(item.quantity)}</td>
      <td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatAmount(item.rate, currency)}</td>
      <td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatAmount(item.amount, currency)}</td>
    </tr>
  `).join('');

  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:10px 12px;font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;text-align:left;">Description</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;text-align:right;">Quantity</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;text-align:right;">Rate</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  return <Html html={html} />;
}
