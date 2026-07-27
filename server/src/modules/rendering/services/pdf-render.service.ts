import React from 'react';
import { Document, renderToHtml } from '@unlayer/react-elements';
import { LineItemTable } from '../components/LineItemTable.js';
import { UsageChart } from '../components/UsageChart.js';
import { LatencyStats } from '../components/LatencyStats.js';
import { PdfConverter } from '../../../infrastructure/pdf-converter.service.js';
import type { WebhookPayload, InvoiceCallRecord } from '../../invoice/entities/invoice.entity.js';
import { RenderException } from '../../../exceptions/app-exceptions.js';
import { formatCurrency } from '../../../utils/number-helpers.js';

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
      React.createElement('div', { style: { fontFamily: "'General Sans', Arial, Helvetica, sans-serif", color: '#f0f0f4', backgroundColor: '#000000', padding: '40px' } },
        this.buildPageOne(payload),
        this.buildPageBreak(),
        this.buildPageTwo(payload)
      )
    );

    return renderToHtml(element);
  }

  private buildPageOne(payload: WebhookPayload): React.ReactElement {
    return React.createElement('div', null,
      React.createElement('div', { style: { borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { fontSize: '22px', margin: '0', fontWeight: '600', letterSpacing: '-0.02em', color: '#f0f0f4' } }, 'INVOICE'),
          React.createElement('p', { style: { fontSize: '12px', color: '#6a6a7a', margin: '4px 0 0', fontWeight: '300' } },
            `Invoice #${payload.invoice.id.split('-')[0]}`
          )
        ),
        React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('span', { style: { fontSize: '16px', fontWeight: '600', color: '#f0f0f4', letterSpacing: '-0.02em' } }, 'Kron'),
          React.createElement('span', { style: { fontSize: '12px', color: '#6a6a7a', marginLeft: '4px', fontWeight: '300' } }, 'Billing')
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' } },
        React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '10px', color: '#6a6a7a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' } }, 'From'),
          React.createElement('p', { style: { fontSize: '13px', margin: '0', color: '#f0f0f4' } }, 'Kron Billing Engine'),
          React.createElement('p', { style: { fontSize: '12px', color: '#a0a0b0', margin: '2px 0' } }, 'billing@kron.dev'),
        ),
        React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('p', { style: { fontSize: '10px', color: '#6a6a7a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' } }, 'To'),
          React.createElement('p', { style: { fontSize: '13px', margin: '0', color: '#f0f0f4' } }, payload.customer.name),
          React.createElement('p', { style: { fontSize: '12px', color: '#a0a0b0', margin: '2px 0' } }, payload.customer.email),
          React.createElement('p', { style: { fontSize: '12px', color: '#a0a0b0', margin: '2px 0' } }, `Account: ${payload.customer.accountId}`),
        )
      ),
      React.createElement('div', { style: { marginBottom: '30px', backgroundColor: '#1a1a20', borderRadius: '10px', padding: '16px' } },
        React.createElement('p', { style: { fontSize: '10px', color: '#6a6a7a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' } }, 'Billing Period'),
        React.createElement('p', { style: { fontSize: '13px', margin: '0', color: '#f0f0f4' } },
          `${new Date(payload.invoice.period.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} \u2013 ${new Date(payload.invoice.period.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}`
        ),
      ),
      React.createElement('div', { style: { marginBottom: '30px' } },
        React.createElement(LineItemTable, { items: payload.invoice.lineItems, currency: payload.invoice.currency })
      ),
      React.createElement('div', { style: { textAlign: 'right', fontSize: '13px', marginBottom: '30px', color: '#a0a0b0' } },
        React.createElement('div', { style: { marginBottom: '4px' } },
          React.createElement('span', null, 'Subtotal: '),
          React.createElement('span', { style: { color: '#f0f0f4' } }, formatCurrency(payload.invoice.subtotal, payload.invoice.currency))
        ),
        React.createElement('div', { style: { marginBottom: '4px' } },
          React.createElement('span', null, 'Tax: '),
          React.createElement('span', { style: { color: '#f0f0f4' } }, formatCurrency(payload.invoice.tax, payload.invoice.currency))
        ),
        React.createElement('div', { style: { fontSize: '16px', fontWeight: '600', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' } },
          React.createElement('span', { style: { color: '#a0a0b0' } }, 'Total: '),
          React.createElement('span', { style: { color: '#f0f0f4' } }, formatCurrency(payload.invoice.total, payload.invoice.currency))
        )
      ),
      React.createElement('div', { style: { marginBottom: '30px' } },
        React.createElement(LatencyStats, { stats: payload.usage.latency })
      ),
    );
  }

  private buildPageBreak(): React.ReactElement {
    return React.createElement('div', { style: { pageBreakBefore: 'always' } });
  }

  private buildPageTwo(payload: WebhookPayload): React.ReactElement {
    return React.createElement('div', null,
      React.createElement('h2', { style: { fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px', fontWeight: '600', letterSpacing: '-0.01em', color: '#f0f0f4' } },
        'Activity and Performance Appendix'
      ),
      React.createElement('div', { style: { marginBottom: '24px' } },
        React.createElement(UsageChart, { data: payload.usage.dailyCallCounts, compact: false })
      ),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' } },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', { style: { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '500', color: '#6a6a7a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' } }, 'Timestamp'),
            React.createElement('th', { style: { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '500', color: '#6a6a7a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' } }, 'Endpoint'),
            React.createElement('th', { style: { padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '500', color: '#6a6a7a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' } }, 'Response (ms)'),
          )
        ),
        React.createElement('tbody', null,
          ...payload.usage.callRecords.map((record: InvoiceCallRecord, i: number) =>
            React.createElement('tr', { key: i },
              React.createElement('td', { style: { padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#a0a0b0' } },
                new Date(record.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })
              ),
              React.createElement('td', { style: { padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#f0f0f4', fontFamily: 'monospace', fontSize: '10px' } }, record.endpoint),
              React.createElement('td', { style: { padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', color: '#a0a0b0' } }, String(record.responseTimeMs)),
            )
          )
        )
      )
    );
  }
}
