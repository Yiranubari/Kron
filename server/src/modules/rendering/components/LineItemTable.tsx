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
  const headerStyle = 'padding:10px 12px;font-size:10px;font-weight:500;color:#6a6a7a;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid rgba(255,255,255,0.06);text-align:left;';
  const cellStyle = 'padding:10px 12px;font-size:13px;color:#f0f0f4;border-bottom:1px solid rgba(255,255,255,0.06);';

  const rowsHtml = items.map((item) => `
    <tr>
      <td style="${cellStyle}">${item.description}</td>
      <td style="${cellStyle}text-align:right;color:#a0a0b0;">${formatNumber(item.quantity)}</td>
      <td style="${cellStyle}text-align:right;color:#a0a0b0;">${formatAmount(item.rate, currency)}</td>
      <td style="${cellStyle}text-align:right;">${formatAmount(item.amount, currency)}</td>
    </tr>
  `).join('');

  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="${headerStyle}">Item</th>
          <th style="${headerStyle}text-align:right;">Qty</th>
          <th style="${headerStyle}text-align:right;">Rate</th>
          <th style="${headerStyle}text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  return <Html html={html} />;
}
