import { Row, Column, Html } from '@unlayer/react-elements';
import type { Customer, InvoiceData } from '../../invoice/entities/invoice.entity.js';
import { formatCurrency } from '../../../utils/number-helpers.js';

type Props = {
  customer: Customer;
  invoice: InvoiceData;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function SummaryCard({ customer, invoice }: Props) {
  const periodStart = formatDate(invoice.period.start);
  const periodEnd = formatDate(invoice.period.end);

  return (
    <Row>
      <Column padding="20px" backgroundColor="#8b9fba" borderRadius="12px">
        <Row>
          <Column>
            <Html html={`
              <div style="font-size:11px;font-weight:300;color:rgba(0,0,0,0.5);">Total charged</div>
              <div style="font-size:28px;font-weight:600;color:#0c0c10;margin-top:4px;letter-spacing:-0.02em;">${formatCurrency(invoice.total, invoice.currency)}</div>
            `} />
          </Column>
          <Column>
            <Html html={`
              <div style="text-align:right;">
                <span style="font-size:11px;font-weight:500;color:rgba(0,0,0,0.4);background:rgba(0,0,0,0.08);padding:3px 8px;border-radius:12px;">${invoice.currency.toUpperCase()}</span>
              </div>
            `} />
          </Column>
        </Row>
        <Row>
          <Column padding="12px 0 0">
            <Html html={`<div style="height:1px;background:rgba(0,0,0,0.1);"></div>`} />
          </Column>
        </Row>
        <Row>
          <Column padding="12px 0 0">
            <Html html={`
              <div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:rgba(0,0,0,0.4);margin-bottom:4px;">Customer</div>
              <div style="font-size:13px;color:#0c0c10;">${customer.name}</div>
              <div style="font-size:13px;color:#0c0c10;">${customer.email}</div>
            `} />
          </Column>
          <Column padding="12px 0 0">
            <Html html={`
              <div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:rgba(0,0,0,0.4);margin-bottom:4px;">Billing period</div>
              <div style="font-size:13px;color:#0c0c10;">${periodStart} &ndash; ${periodEnd}</div>
            `} />
          </Column>
        </Row>
      </Column>
    </Row>
  );
}
