import React from 'react';
import { Email, renderToHtml, Button } from '@unlayer/react-elements';
import { UsageChart } from '../components/UsageChart.js';
import { LineItemTable } from '../components/LineItemTable.js';
import { SummaryCard } from '../components/SummaryCard.js';
import { LatencyStats } from '../components/LatencyStats.js';
import type { WebhookPayload } from '../../invoice/entities/invoice.entity.js';

export class EmailRenderService {
  render(payload: WebhookPayload, portalUrl: string): string {
    const element = React.createElement(Email, null,
      React.createElement('div', { style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '600px', margin: '0 auto' } },
        React.createElement('div', { style: { backgroundColor: '#111827', padding: '24px', borderRadius: '8px 8px 0 0' } },
          React.createElement('span', { style: { color: '#ffffff', fontSize: '20px', fontWeight: 'bold' } }, 'Kron'),
          React.createElement('span', { style: { color: '#9ca3af', fontSize: '14px', marginLeft: '8px' } }, 'Billing')
        ),
        React.createElement('div', { style: { padding: '24px', backgroundColor: '#ffffff' } },
          React.createElement('p', { style: { fontSize: '16px', color: '#374151', marginBottom: '16px' } },
            `Hi ${payload.customer.name.split(' ')[0]},`
          ),
          React.createElement('p', { style: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' } },
            'Your payment has been received. Here\'s a summary of your billing period.'
          ),
          React.createElement(SummaryCard, { customer: payload.customer, invoice: payload.invoice }),
          React.createElement('div', { style: { marginTop: '24px' } },
            React.createElement(UsageChart, { data: payload.usage.dailyCallCounts, compact: true })
          ),
          React.createElement('div', { style: { marginTop: '24px' } },
            React.createElement(LineItemTable, { items: payload.invoice.lineItems, currency: payload.invoice.currency })
          ),
          React.createElement('div', { style: { marginTop: '16px', textAlign: 'right', fontSize: '14px', color: '#374151' } },
            React.createElement('span', null, `Subtotal: `),
            React.createElement('strong', null,
              new Intl.NumberFormat('en-US', { style: 'currency', currency: payload.invoice.currency }).format(payload.invoice.subtotal)
            ),
            React.createElement('br'),
            React.createElement('span', null, `Tax: `),
            React.createElement('strong', null,
              new Intl.NumberFormat('en-US', { style: 'currency', currency: payload.invoice.currency }).format(payload.invoice.tax)
            ),
            React.createElement('br'),
            React.createElement('span', { style: { fontSize: '16px' } }, `Total: `),
            React.createElement('strong', { style: { fontSize: '16px' } },
              new Intl.NumberFormat('en-US', { style: 'currency', currency: payload.invoice.currency }).format(payload.invoice.total)
            )
          ),
          React.createElement('div', { style: { marginTop: '24px' } },
            React.createElement(LatencyStats, { stats: payload.usage.latency })
          ),
          React.createElement('div', { style: { textAlign: 'center', marginTop: '28px' } },
            React.createElement(Button, {
              href: portalUrl,
              style: {
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }
            }, 'View Full Dashboard')
          )
        ),
        React.createElement('div', { style: { padding: '16px 24px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '0 0 8px 8px' } },
          'Kron Billing Engine · Usage-based billing simplified'
        )
      )
    );

    return renderToHtml(element);
  }
}
