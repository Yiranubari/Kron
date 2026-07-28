import { createElement } from 'react';
import { Email, renderToHtml, Html } from '@unlayer/react-elements';
import type { WebhookPayload } from '../../invoice/entities/invoice.entity.js';
import { formatCurrency } from '../../../utils/number-helpers.js';

type EmailContent = {
  html: string;
  text: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export class EmailRenderService {
  render(payload: WebhookPayload, portalUrl: string): EmailContent {
    const html = this.renderHtml(payload, portalUrl);
    const text = this.renderText(payload, portalUrl);
    return { html, text };
  }

  private renderHtml(payload: WebhookPayload, portalUrl: string): string {
    const summaryHtml = this.buildSummaryCard(payload);
    const lineItemsHtml = this.buildLineItems(payload);
    const totalsHtml = this.buildTotals(payload);
    const buttonHtml = this.buildButton(portalUrl);

    const emailHtml = `
      <div style="font-family:'General Sans',Arial,Helvetica,sans-serif;background-color:#000000;margin:0;padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
          <tr>
            <td align="center" style="padding:0;">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                <tr>
                  <td style="padding:28px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="color:#ededf0;font-size:18px;font-weight:600;letter-spacing:-0.02em;">Kron</span>
                    <span style="color:#606070;font-size:13px;margin-left:6px;font-weight:300;">Billing</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 24px;">
                    <p style="font-size:15px;color:#ededf0;margin:0 0 4px;font-weight:300;">
                      Hi ${payload.customer.name.split(' ')[0]},
                    </p>
                    <p style="font-size:13px;color:#606070;margin:0 0 24px;font-weight:300;">
                      Your payment has been received. Here is a summary of your billing period.
                    </p>

                    ${summaryHtml}
                    ${lineItemsHtml}
                    ${totalsHtml}
                    ${buttonHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;text-align:center;font-size:11px;color:#606070;border-top:1px solid rgba(255,255,255,0.06);font-weight:300;">
                    Kron Billing Engine &middot; Usage-based billing simplified
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const element = createElement(Email, null,
      createElement(Html, { html: emailHtml })
    );

    return renderToHtml(element);
  }

  private buildSummaryCard(payload: WebhookPayload): string {
    const total = formatCurrency(payload.invoice.total, payload.invoice.currency);
    const periodStart = formatDate(payload.invoice.period.start);
    const periodEnd = formatDate(payload.invoice.period.end);

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="background:linear-gradient(135deg,#4f8cff 0%,#3a70d0 100%);border-radius:12px;padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:12px;font-weight:500;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Total charged</div>
                  <div style="font-size:36px;font-weight:600;color:#ffffff;letter-spacing:-0.03em;line-height:1;">${total}</div>
                </td>
                <td style="text-align:right;vertical-align:top;">
                  <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.7);background:rgba(0,0,0,0.15);padding:4px 10px;border-radius:20px;letter-spacing:0.04em;">${payload.invoice.currency.toUpperCase()}</span>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:rgba(0,0,0,0.1);margin:20px 0;"></div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%">
                  <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Customer</div>
                  <div style="font-size:13px;color:#ffffff;font-weight:400;">${payload.customer.name}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.6);font-weight:300;">${payload.customer.email}</div>
                </td>
                <td width="50%" style="text-align:right;">
                  <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Period</div>
                  <div style="font-size:13px;color:#ffffff;font-weight:400;">${periodStart} - ${periodEnd}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  private buildLineItems(payload: WebhookPayload): string {
    const rows = payload.invoice.lineItems.map((item) => `
      <tr>
        <td style="padding:10px 12px;font-size:13px;color:#ededf0;border-bottom:1px solid rgba(255,255,255,0.05);">${item.description}</td>
        <td style="padding:10px 12px;font-size:13px;color:#a0a0ae;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${formatNumber(item.quantity)}</td>
        <td style="padding:10px 12px;font-size:13px;color:#a0a0ae;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${formatCurrency(item.rate, payload.invoice.currency)}</td>
        <td style="padding:10px 12px;font-size:13px;color:#ededf0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);font-weight:500;">${formatCurrency(item.amount, payload.invoice.currency)}</td>
      </tr>
    `).join('');

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background-color:#0d0d14;border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
        <tr>
          <td style="padding:20px;">
            <div style="font-size:13px;font-weight:500;color:#ededf0;margin-bottom:16px;letter-spacing:0.01em;">Invoice details</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="padding:0 0 10px 0;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.05);text-align:left;">Item</th>
                  <th style="padding:0 0 10px 0;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">Qty</th>
                  <th style="padding:0 0 10px 0;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">Rate</th>
                  <th style="padding:0 0 10px 0;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  private buildTotals(payload: WebhookPayload): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:4px 0;text-align:right;color:#a0a0ae;font-size:13px;">Subtotal:</td>
          <td style="padding:4px 0;text-align:right;color:#ededf0;font-size:13px;width:100px;">${formatCurrency(payload.invoice.subtotal, payload.invoice.currency)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;text-align:right;color:#a0a0ae;font-size:13px;">Tax:</td>
          <td style="padding:4px 0;text-align:right;color:#ededf0;font-size:13px;width:100px;">${formatCurrency(payload.invoice.tax, payload.invoice.currency)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0 0;text-align:right;color:#ededf0;font-size:15px;font-weight:600;border-top:1px solid rgba(79,140,255,0.2);">Total:</td>
          <td style="padding:10px 0 0;text-align:right;color:#4f8cff;font-size:18px;font-weight:700;letter-spacing:-0.02em;border-top:1px solid rgba(79,140,255,0.2);">${formatCurrency(payload.invoice.total, payload.invoice.currency)}</td>
        </tr>
      </table>
    `;
  }

  private buildButton(portalUrl: string): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:0;">
            <a href="${portalUrl}" style="display:inline-block;background-color:#4f8cff;color:#ffffff;padding:14px 36px;border-radius:10px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.01em;">
              View Full Dashboard
            </a>
          </td>
        </tr>
      </table>
    `;
  }

  private renderText(payload: WebhookPayload, portalUrl: string): string {
    const lines: string[] = [];

    lines.push('Kron Billing');
    lines.push('');
    lines.push(`Hi ${payload.customer.name.split(' ')[0]},`);
    lines.push('');
    lines.push('Your payment has been received. Here is a summary of your billing period.');
    lines.push('');
    lines.push(`Account: ${payload.customer.name} (${payload.customer.email})`);
    lines.push('');
    lines.push('Invoice Summary');
    lines.push('');
    for (const item of payload.invoice.lineItems) {
      lines.push(`  ${item.description}: ${item.quantity} x ${formatCurrency(item.rate, payload.invoice.currency)} = ${formatCurrency(item.amount, payload.invoice.currency)}`);
    }
    lines.push('');
    lines.push(`  Subtotal: ${formatCurrency(payload.invoice.subtotal, payload.invoice.currency)}`);
    lines.push(`  Tax:      ${formatCurrency(payload.invoice.tax, payload.invoice.currency)}`);
    lines.push(`  Total:    ${formatCurrency(payload.invoice.total, payload.invoice.currency)}`);
    lines.push('');
    lines.push(`Period: ${payload.invoice.period.start.split('T')[0]} to ${payload.invoice.period.end.split('T')[0]}`);
    lines.push('');
    lines.push(`View your full dashboard: ${portalUrl}`);
    lines.push('');
    lines.push('--');
    lines.push('Kron Billing Engine - Usage-based billing simplified');

    return lines.join('\n');
  }
}
