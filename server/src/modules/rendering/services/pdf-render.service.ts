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
      React.createElement('div', { style: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#111827', padding: '40px' } },
        this.buildPageOne(payload),
        this.buildPageBreak(),
        this.buildPageTwo(payload)
      )
    );

    return renderToHtml(element);
  }

  private buildPageOne(payload: WebhookPayload): React.ReactElement {
    return React.createElement('div', null,
      React.createElement('div', { style: { borderBottom: '2px solid #111827', paddingBottom: '20px', marginBottom: '30px' } },
        React.createElement('h1', { style: { fontSize: '24px', margin: '0' } }, 'INVOICE'),
        React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: '4px 0 0' } },
          `Invoice #${payload.invoice.id.split('-')[0]}`
        )
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' } },
        React.createElement('div', null,
          React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: '0 0 4px' } }, 'From'),
          React.createElement('p', { style: { fontSize: '14px', margin: '0' } }, 'Kron Billing Engine'),
          React.createElement('p', { style: { fontSize: '12px', color: '#374151', margin: '2px 0' } }, 'billing@kron.dev'),
        ),
        React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: '0 0 4px' } }, 'To'),
          React.createElement('p', { style: { fontSize: '14px', margin: '0' } }, payload.customer.name),
          React.createElement('p', { style: { fontSize: '12px', color: '#374151', margin: '2px 0' } }, payload.customer.email),
          React.createElement('p', { style: { fontSize: '12px', color: '#374151', margin: '2px 0' } }, `Account: ${payload.customer.accountId}`),
        )
      ),
      React.createElement('div', { style: { marginBottom: '30px' } },
        React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: '0 0 4px' } }, 'Billing Period'),
        React.createElement('p', { style: { fontSize: '14px', margin: '0' } },
          `${new Date(payload.invoice.period.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} — ${new Date(payload.invoice.period.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}`
        ),
      ),
      React.createElement('div', { style: { marginBottom: '30px' } },
        React.createElement(LineItemTable, { items: payload.invoice.lineItems, currency: payload.invoice.currency })
      ),
      React.createElement('div', { style: { textAlign: 'right', fontSize: '14px', marginBottom: '30px' } },
        React.createElement('div', { style: { marginBottom: '4px' } },
          React.createElement('span', null, 'Subtotal: '),
          React.createElement('span', null, formatCurrency(payload.invoice.subtotal, payload.invoice.currency))
        ),
        React.createElement('div', { style: { marginBottom: '4px' } },
          React.createElement('span', null, 'Tax: '),
          React.createElement('span', null, formatCurrency(payload.invoice.tax, payload.invoice.currency))
        ),
        React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #111827', paddingTop: '8px' } },
          React.createElement('span', null, 'Total: '),
          React.createElement('span', null, formatCurrency(payload.invoice.total, payload.invoice.currency))
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
      React.createElement('h2', { style: { fontSize: '18px', borderBottom: '2px solid #111827', paddingBottom: '10px', marginBottom: '20px' } },
        'Activity and Performance Appendix'
      ),
      React.createElement('div', { style: { marginBottom: '24px' } },
        React.createElement(UsageChart, { data: payload.usage.dailyCallCounts, compact: false })
      ),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' } },
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', { style: { padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #d1d5db', fontWeight: 'bold', color: '#374151' } }, 'Timestamp'),
            React.createElement('th', { style: { padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #d1d5db', fontWeight: 'bold', color: '#374151' } }, 'Endpoint'),
            React.createElement('th', { style: { padding: '8px 10px', textAlign: 'right', borderBottom: '2px solid #d1d5db', fontWeight: 'bold', color: '#374151' } }, 'Response (ms)'),
          )
        ),
        React.createElement('tbody', null,
          ...payload.usage.callRecords.map((record: InvoiceCallRecord, i: number) =>
            React.createElement('tr', { key: i },
              React.createElement('td', { style: { padding: '6px 10px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' } },
                new Date(record.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })
              ),
              React.createElement('td', { style: { padding: '6px 10px', borderBottom: '1px solid #e5e7eb', color: '#374151', fontFamily: 'monospace', fontSize: '10px' } }, record.endpoint),
              React.createElement('td', { style: { padding: '6px 10px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#6b7280' } }, String(record.responseTimeMs)),
            )
          )
        )
      )
    );
  }
}
