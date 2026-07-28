import React from 'react';
import { Document, renderToHtml, Row, Column, Html } from '@unlayer/react-elements';
import { LineItemTable } from '../components/LineItemTable.js';
import { UsageChart } from '../components/UsageChart.js';
import { PdfConverter } from '../../../infrastructure/pdf-converter.service.js';
import type { WebhookPayload, InvoiceCallRecord } from '../../invoice/entities/invoice.entity.js';
import { RenderException } from '../../../exceptions/app-exceptions.js';
import { formatCurrency } from '../../../utils/number-helpers.js';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
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
    const element = React.createElement(Document, null,
      React.createElement('div', {
        style: {
          fontFamily: "'General Sans', Arial, Helvetica, sans-serif",
          color: '#e8e8ec',
          backgroundColor: '#08080c',
          padding: '48px 56px',
          maxWidth: '800px',
          margin: '0 auto',
        }
      },
        this.buildHeader(payload),
        this.buildPageOne(payload),
        this.buildPageBreak(),
        this.buildPageTwo(payload),
        this.buildFooter(),
      )
    );

    return renderToHtml(element);
  }

  private buildHeader(payload: WebhookPayload): React.ReactElement {
    return React.createElement('div', {
      style: {
        borderBottom: '1px solid rgba(79, 140, 255, 0.15)',
        paddingBottom: '24px',
        marginBottom: '36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }
    },
      React.createElement('div', null,
        React.createElement('h1', {
          style: {
            fontSize: '26px',
            margin: '0',
            fontWeight: '700',
            letterSpacing: '-0.03em',
            color: '#e8e8ec',
          }
        }, 'INVOICE'),
        React.createElement('p', {
          style: {
            fontSize: '11px',
            color: '#4f8cff',
            margin: '4px 0 0',
            fontWeight: '500',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }
        }, `#${payload.invoice.id.split('-')[0]}`),
      ),
      React.createElement('div', { style: { textAlign: 'right' } },
        React.createElement('span', {
          style: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#e8e8ec',
            letterSpacing: '-0.03em',
          }
        }, 'Kron'),
        React.createElement('span', {
          style: {
            fontSize: '12px',
            color: '#606070',
            marginLeft: '6px',
            fontWeight: '300',
          }
        }, 'Billing'),
      ),
    );
  }

  private buildPageOne(payload: WebhookPayload): React.ReactElement {
    return React.createElement('div', null,
      React.createElement(Row, null,
        React.createElement(Column, { padding: '0 24px 0 0' },
          React.createElement('div', { style: this.labelBlockStyle() },
            React.createElement('p', { style: this.labelStyle() }, 'From'),
            React.createElement('p', { style: this.valueStyle() }, 'Kron Billing Engine'),
            React.createElement('p', { style: this.metaStyle() }, 'billing@kron.dev'),
          ),
        ),
        React.createElement(Column, { padding: '0 0 0 24px' },
          React.createElement('div', { style: { ...this.labelBlockStyle(), textAlign: 'right' } as React.CSSProperties },
            React.createElement('p', { style: this.labelStyle() }, 'To'),
            React.createElement('p', { style: this.valueStyle() }, payload.customer.name),
            React.createElement('p', { style: this.metaStyle() }, payload.customer.email),
            React.createElement('p', { style: this.metaStyle() }, `Account: ${payload.customer.accountId.slice(0, 12)}...`),
          ),
        ),
      ),

      React.createElement(Row, null,
        React.createElement(Column, { padding: '24px 0' },
          React.createElement('table', {
            width: '100%',
            cellPadding: '0',
            cellSpacing: '0',
            style: {
              backgroundColor: '#0d0d14',
              borderRadius: '10px',
              borderCollapse: 'separate',
            }
          },
            React.createElement('tbody', null,
              React.createElement('tr', null,
                React.createElement('td', { style: { padding: '16px 20px', width: '50%' } },
                  React.createElement('p', { style: { fontSize: '9px', color: '#606070', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' } }, 'Billing Period'),
                  React.createElement('p', { style: { fontSize: '13px', color: '#e8e8ec', margin: '0', fontWeight: '400' } },
                    `${formatDate(payload.invoice.period.start)} - ${formatDate(payload.invoice.period.end)}`
                  ),
                ),
                React.createElement('td', { style: { padding: '16px 20px', width: '50%', textAlign: 'right' } },
                  React.createElement('p', { style: { fontSize: '9px', color: '#606070', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' } }, 'Status'),
                  React.createElement('p', { style: { fontSize: '12px', color: '#4ade80', margin: '0', fontWeight: '500' } }, 'Paid'),
                ),
              ),
            ),
          ),
        ),
      ),

      React.createElement(Row, null,
        React.createElement(Column, { padding: '24px 0 0' },
          React.createElement('div', { style: { fontSize: '12px', fontWeight: '600', color: '#606070', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Invoice Details'),
          React.createElement(LineItemTable, { items: payload.invoice.lineItems, currency: payload.invoice.currency }),
          this.buildTotals(payload),
        ),
      ),
    );
  }

  private buildTotals(payload: WebhookPayload): React.ReactElement {
    const rowStyle = 'padding:8px 12px;font-size:12px;';
    const labelColor = '#909098';

    const html = `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
        <tr>
          <td style="${rowStyle}text-align:right;color:${labelColor};padding-right:16px;">Subtotal</td>
          <td style="${rowStyle}text-align:right;color:#e8e8ec;width:120px;font-weight:500;">${formatCurrency(payload.invoice.subtotal, payload.invoice.currency)}</td>
        </tr>
        <tr>
          <td style="${rowStyle}text-align:right;color:${labelColor};padding-right:16px;">Tax</td>
          <td style="${rowStyle}text-align:right;color:#e8e8ec;width:120px;font-weight:500;">${formatCurrency(payload.invoice.tax, payload.invoice.currency)}</td>
        </tr>
        <tr>
          <td style="padding:12px;text-align:right;color:#e8e8ec;padding-right:16px;border-top:1px solid rgba(79,140,255,0.2);font-weight:600;font-size:14px;">Total</td>
          <td style="padding:12px;text-align:right;color:#4f8cff;border-top:1px solid rgba(79,140,255,0.2);width:120px;font-weight:700;font-size:18px;letter-spacing:-0.02em;">${formatCurrency(payload.invoice.total, payload.invoice.currency)}</td>
        </tr>
      </table>
    `;

    return React.createElement(Html, { html });
  }

  private buildPageBreak(): React.ReactElement {
    return React.createElement('div', { style: { pageBreakBefore: 'always' } });
  }

  private buildPageTwo(payload: WebhookPayload): React.ReactElement {
    return React.createElement('div', null,
      React.createElement('h2', {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#e8e8ec',
          letterSpacing: '-0.01em',
          margin: '0 0 20px',
          padding: '0 0 12px',
          borderBottom: '1px solid rgba(79, 140, 255, 0.15)',
        }
      }, 'Activity & Performance Appendix'),

      React.createElement('div', { style: { marginBottom: '24px' } },
        React.createElement(UsageChart, { data: payload.usage.dailyCallCounts, compact: false }),
      ),

      React.createElement('div', null,
        React.createElement('p', {
          style: {
            fontSize: '11px',
            fontWeight: '600',
            color: '#606070',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }
        }, 'API Call Records'),
        this.buildCallRecordsTable(payload.usage.callRecords),
      ),
    );
  }

  private buildCallRecordsTable(records: InvoiceCallRecord[]): React.ReactElement {
    const thStyle = 'padding:8px 10px;text-align:left;border-bottom:1px solid rgba(79,140,255,0.1);font-size:9px;font-weight:600;color:#606070;text-transform:uppercase;letter-spacing:0.06em;';
    const tdStyle = 'padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:10px;';

    const headerHtml = `
      <thead>
        <tr>
          <th style="${thStyle}width:30%;">Timestamp</th>
          <th style="${thStyle}">Endpoint</th>
          <th style="${thStyle}text-align:right;width:15%;">Response</th>
        </tr>
      </thead>
    `;

    const rowsHtml = records.map((record, i) => {
      const bgColor = i % 2 === 0 ? '' : 'background-color:rgba(255,255,255,0.02);';
      return `
        <tr style="${bgColor}">
          <td style="${tdStyle}color:#909098;">${new Date(record.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })}</td>
          <td style="${tdStyle}color:#e8e8ec;font-family:monospace;font-size:9px;">${record.endpoint}</td>
          <td style="${tdStyle}text-align:right;color:#a0a0ae;">${record.responseTimeMs}ms</td>
        </tr>
      `;
    }).join('');

    const html = `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${headerHtml}
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    return React.createElement(Html, { html });
  }

  private buildFooter(): React.ReactElement {
    return React.createElement('div', {
      style: {
        marginTop: '48px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
        fontSize: '9px',
        color: '#606070',
        letterSpacing: '0.02em',
      }
    }, 'Kron Billing Engine - Generated with Unlayer Elements');
  }

  private labelBlockStyle(): React.CSSProperties {
    return { marginBottom: '24px' };
  }

  private labelStyle(): React.CSSProperties {
    return {
      fontSize: '9px',
      color: '#606070',
      margin: '0 0 4px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: '600',
    };
  }

  private valueStyle(): React.CSSProperties {
    return {
      fontSize: '14px',
      margin: '0',
      color: '#e8e8ec',
      fontWeight: '500',
    };
  }

  private metaStyle(): React.CSSProperties {
    return {
      fontSize: '12px',
      color: '#909098',
      margin: '2px 0',
      fontWeight: '300',
    };
  }
}
