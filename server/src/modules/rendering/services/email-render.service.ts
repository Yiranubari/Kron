import React from 'react';
import { Email, renderToHtml, Button } from '@unlayer/react-elements';
import { LineItemTable } from '../components/LineItemTable.js';
import { SummaryCard } from '../components/SummaryCard.js';
import type { WebhookPayload } from '../../invoice/entities/invoice.entity.js';

type EmailContent = {
  html: string;
  text: string;
};

function currency(amount: number, code: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
}

export class EmailRenderService {
  render(payload: WebhookPayload, portalUrl: string): EmailContent {
    const html = this.renderHtml(payload, portalUrl);
    const text = this.renderText(payload, portalUrl);
    return { html, text };
  }

  private renderHtml(payload: WebhookPayload, portalUrl: string): string {
    const element = React.createElement(Email, null,
      React.createElement('div', { style: { fontFamily: "'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: '600px', margin: '0 auto', backgroundColor: '#000000' } },
        React.createElement('div', { style: { padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' } },
          React.createElement('span', { style: { color: '#f0f0f4', fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em' } }, 'Kron'),
          React.createElement('span', { style: { color: '#6a6a7a', fontSize: '13px', marginLeft: '6px', fontWeight: '300' } }, 'Billing')
        ),
        React.createElement('div', { style: { padding: '28px 24px' } },
          React.createElement('p', { style: { fontSize: '15px', color: '#f0f0f4', marginBottom: '4px', fontWeight: '300' } },
            `Hi ${payload.customer.name.split(' ')[0]},`
          ),
          React.createElement('p', { style: { fontSize: '13px', color: '#6a6a7a', marginBottom: '24px', fontWeight: '300' } },
            'Your payment has been received. Here is a summary of your billing period.'
          ),
          React.createElement(SummaryCard, { customer: payload.customer, invoice: payload.invoice }),
          React.createElement('div', { style: { marginTop: '20px' } },
            React.createElement(LineItemTable, { items: payload.invoice.lineItems, currency: payload.invoice.currency })
          ),
          React.createElement('div', { style: { marginTop: '16px', textAlign: 'right', fontSize: '13px', color: '#a0a0b0' } },
            React.createElement('div', { style: { marginBottom: '4px' } },
              React.createElement('span', null, 'Subtotal: '),
              React.createElement('span', { style: { color: '#f0f0f4' } }, currency(payload.invoice.subtotal, payload.invoice.currency))
            ),
            React.createElement('div', { style: { marginBottom: '4px' } },
              React.createElement('span', null, 'Tax: '),
              React.createElement('span', { style: { color: '#f0f0f4' } }, currency(payload.invoice.tax, payload.invoice.currency))
            ),
            React.createElement('div', { style: { fontSize: '15px', fontWeight: '600', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' } },
              React.createElement('span', { style: { color: '#a0a0b0' } }, 'Total: '),
              React.createElement('span', { style: { color: '#f0f0f4' } }, currency(payload.invoice.total, payload.invoice.currency))
            )
          ),
          React.createElement('div', { style: { textAlign: 'center', marginTop: '32px' } },
            React.createElement(Button, {
              href: portalUrl,
              style: {
                backgroundColor: '#4f8cff',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-block',
              }
            }, 'View Full Dashboard')
          )
        ),
        React.createElement('div', { style: { padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#6a6a7a', borderTop: '1px solid rgba(255,255,255,0.06)' } },
          'Kron Billing Engine \u00b7 Usage-based billing simplified'
        )
      )
    );

    return renderToHtml(element);
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
      lines.push(`  ${item.description}: ${item.quantity} x ${currency(item.rate, payload.invoice.currency)} = ${currency(item.amount, payload.invoice.currency)}`);
    }
    lines.push('');
    lines.push(`  Subtotal: ${currency(payload.invoice.subtotal, payload.invoice.currency)}`);
    lines.push(`  Tax:      ${currency(payload.invoice.tax, payload.invoice.currency)}`);
    lines.push(`  Total:    ${currency(payload.invoice.total, payload.invoice.currency)}`);
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
