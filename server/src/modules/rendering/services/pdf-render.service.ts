import { PdfConverter } from '../../../infrastructure/pdf-converter.service.js';
import type { WebhookPayload, InvoiceCallRecord } from '../../invoice/entities/invoice.entity.js';
import { RenderException } from '../../../exceptions/app-exceptions.js';
import { formatCurrency } from '../../../utils/number-helpers.js';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export class PdfRenderService {
  constructor(private readonly pdfConverter: PdfConverter) {}

  async render(payload: WebhookPayload): Promise<Buffer> {
    const html = this.buildDocument(payload);

    try {
      return await this.pdfConverter.convert(html);
    } catch (err) {
      throw new RenderException(
        'Failed to render PDF document',
        err instanceof Error ? err.message : undefined,
      );
    }
  }

  renderPreview(payload: WebhookPayload): string {
    return this.buildDocument(payload);
  }

  private buildDocument(payload: WebhookPayload): string {
    const pageOne = this.buildPageOne(payload);
    const pageTwo = this.buildPageTwo(payload);
    const pageStyle = "font-family:'General Sans',Arial,Helvetica,sans-serif;color:#e8e8ec;background-color:#08080c;padding:48px 56px;max-width:800px;margin:0 auto;";

    return `
      <div style="${pageStyle}">
        ${this.buildHeader(payload)}
        ${pageOne}
        ${this.buildFooter()}
      </div>
      <div style="page-break-before:always;"></div>
      <div style="${pageStyle}">
        ${pageTwo}
      </div>
    `;
  }

  private buildHeader(payload: WebhookPayload): string {
    return `
      <div style="border-bottom:1px solid rgba(79,140,255,0.15);padding-bottom:24px;margin-bottom:36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size:26px;font-weight:700;letter-spacing:-0.03em;color:#e8e8ec;">INVOICE</div>
              <div style="font-size:11px;color:#4f8cff;margin-top:4px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;">#${payload.invoice.id.split('-')[0]}</div>
            </td>
            <td style="text-align:right;">
              <span style="font-size:20px;font-weight:700;color:#e8e8ec;letter-spacing:-0.03em;">Kron</span>
              <span style="font-size:12px;color:#606070;margin-left:6px;font-weight:300;">Billing</span>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  private buildPageOne(payload: WebhookPayload): string {
    const periodStart = formatDate(payload.invoice.period.start);
    const periodEnd = formatDate(payload.invoice.period.end);

    const itemsHtml = payload.invoice.lineItems.map((item) => `
      <tr>
        <td style="padding:10px 12px;font-size:13px;color:#e8e8ec;border-bottom:1px solid rgba(255,255,255,0.06);">${item.description}</td>
        <td style="padding:10px 12px;font-size:13px;color:#a0a0ae;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${formatNumber(item.quantity)}</td>
        <td style="padding:10px 12px;font-size:13px;color:#a0a0ae;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${formatCurrency(item.rate, payload.invoice.currency)}</td>
        <td style="padding:10px 12px;font-size:13px;color:#e8e8ec;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);font-weight:500;">${formatCurrency(item.amount, payload.invoice.currency)}</td>
      </tr>
    `).join('');

    return `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:50%;padding:0 24px 0 0;">
            <div style="margin-bottom:24px;">
              <div style="font-size:9px;color:#606070;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">From</div>
              <div style="font-size:14px;color:#e8e8ec;font-weight:500;">Kron Billing Engine</div>
              <div style="font-size:12px;color:#909098;margin-top:2px;font-weight:300;">billing@kron.dev</div>
            </div>
          </td>
          <td style="width:50%;padding:0 0 0 24px;">
            <div style="margin-bottom:24px;text-align:right;">
              <div style="font-size:9px;color:#606070;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">To</div>
              <div style="font-size:14px;color:#e8e8ec;font-weight:500;">${payload.customer.name}</div>
              <div style="font-size:12px;color:#909098;margin-top:2px;font-weight:300;">${payload.customer.email}</div>
              <div style="font-size:12px;color:#909098;margin-top:2px;font-weight:300;">Account: ${payload.customer.accountId.slice(0, 12)}...</div>
            </div>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="background-color:#0d0d14;border-radius:10px;padding:16px 20px;">
            <div style="font-size:9px;color:#606070;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Billing Period</div>
            <div style="font-size:13px;color:#e8e8ec;font-weight:400;">${periodStart} - ${periodEnd}</div>
          </td>
          <td style="background-color:#0d0d14;border-radius:10px;padding:16px 20px;text-align:right;">
            <div style="font-size:9px;color:#606070;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Status</div>
            <div style="font-size:12px;color:#4ade80;font-weight:500;">Paid</div>
          </td>
        </tr>
      </table>

      <div style="font-size:12px;font-weight:600;color:#606070;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.06em;">Invoice Details</div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:10px 12px;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(79,140,255,0.1);text-align:left;">Item</th>
            <th style="padding:10px 12px;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(79,140,255,0.1);text-align:right;">Qty</th>
            <th style="padding:10px 12px;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(79,140,255,0.1);text-align:right;">Rate</th>
            <th style="padding:10px 12px;font-size:10px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(79,140,255,0.1);text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
        <tr>
          <td style="padding:8px 12px;text-align:right;color:#909098;padding-right:16px;font-size:12px;">Subtotal</td>
          <td style="padding:8px 12px;text-align:right;color:#e8e8ec;width:120px;font-weight:500;font-size:12px;">${formatCurrency(payload.invoice.subtotal, payload.invoice.currency)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;text-align:right;color:#909098;padding-right:16px;font-size:12px;">Tax</td>
          <td style="padding:8px 12px;text-align:right;color:#e8e8ec;width:120px;font-weight:500;font-size:12px;">${formatCurrency(payload.invoice.tax, payload.invoice.currency)}</td>
        </tr>
        <tr>
          <td style="padding:12px;text-align:right;color:#e8e8ec;padding-right:16px;border-top:1px solid rgba(79,140,255,0.2);font-weight:600;font-size:14px;">Total</td>
          <td style="padding:12px;text-align:right;color:#4f8cff;border-top:1px solid rgba(79,140,255,0.2);width:120px;font-weight:700;font-size:18px;letter-spacing:-0.02em;">${formatCurrency(payload.invoice.total, payload.invoice.currency)}</td>
        </tr>
      </table>
    `;
  }

  private buildPageTwo(payload: WebhookPayload): string {
    const barMaxHeight = 80;
    const maxCount = Math.max(...payload.usage.dailyCallCounts.map((d) => d.count), 1);

    const barsHtml = payload.usage.dailyCallCounts.map((day) => {
      const barHeight = Math.round((day.count / maxCount) * barMaxHeight);
      const date = new Date(day.date + 'T00:00:00Z');
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

      return `
        <td style="width:${Math.floor(100 / payload.usage.dailyCallCounts.length)}%;padding:1px;vertical-align:bottom;text-align:center;">
          <div title="${label}: ${day.count.toLocaleString()}" style="height:${Math.max(barHeight, 2)}px;background-color:#4f8cff;border-radius:2px 2px 0 0;min-height:2px;margin:0 auto;width:70%;"></div>
        </td>
      `;
    }).join('');

    const thStyle = 'padding:8px 10px;text-align:left;border-bottom:1px solid rgba(79,140,255,0.1);font-size:9px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;';
    const tdStyle = 'padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:10px;';

    const recordsHtml = payload.usage.callRecords.map((record: InvoiceCallRecord, i: number) => {
      const bg = i % 2 === 0 ? '' : 'background-color:rgba(255,255,255,0.02);';
      return `
        <tr style="${bg}">
          <td style="${tdStyle}color:#909098;">${new Date(record.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })}</td>
          <td style="${tdStyle}color:#e8e8ec;font-family:monospace;font-size:9px;">${record.endpoint}</td>
          <td style="${tdStyle}text-align:right;color:#a0a0ae;">${record.responseTimeMs}ms</td>
        </tr>
      `;
    }).join('');

    return `
      <h2 style="font-size:14px;font-weight:600;color:#e8e8ec;letter-spacing:-0.01em;margin:0 0 20px;padding:0 0 12px;border-bottom:1px solid rgba(79,140,255,0.15);">Activity & Performance Appendix</h2>

      <div style="margin-bottom:24px;">
        <div style="font-size:12px;font-weight:600;color:#d0d0d8;letter-spacing:0.02em;margin-bottom:8px;">DAILY API CALLS</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>${barsHtml}</tr>
          </tbody>
        </table>
      </div>

      <div style="font-size:11px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">API Call Records</div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th style="${thStyle}width:30%;">Timestamp</th>
            <th style="${thStyle}">Endpoint</th>
            <th style="${thStyle}text-align:right;width:15%;">Response</th>
          </tr>
        </thead>
        <tbody>
          ${recordsHtml}
        </tbody>
      </table>
    `;
  }

  private buildFooter(): string {
    return `
      <div style="margin-top:48px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;font-size:9px;color:#606070;letter-spacing:0.02em;">
        Kron Billing Engine - Generated with Unlayer Elements
      </div>
    `;
  }
}
