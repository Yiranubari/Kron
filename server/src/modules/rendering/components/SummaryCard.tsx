import { Row, Column, Html } from '@unlayer/react-elements';
import type { Customer, InvoiceData } from '../../invoice/entities/invoice.entity.js';
import { formatCurrency } from '../../../utils/number-helpers.js';

type Props = {
  customer: Customer;
  invoice: InvoiceData;
};

function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', opts ?? { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function SummaryCard({ customer, invoice }: Props) {
  const periodStart = formatDate(invoice.period.start);
  const periodEnd = formatDate(invoice.period.end);

  return (
    <Row>
      <Column padding="16px" backgroundColor="#f9fafb" borderRadius="8px">
        <Row>
          <Column>
            <Html html={`
              <div style="font-size:12px;color:#6b7280;">Billing Period</div>
              <div style="font-size:14px;font-weight:bold;color:#111827;margin-top:2px;">${periodStart} — ${periodEnd}</div>
            `} />
          </Column>
          <Column>
            <Html html={`
              <div style="font-size:12px;color:#6b7280;text-align:right;">Total Charged</div>
              <div style="font-size:20px;font-weight:bold;color:#111827;text-align:right;margin-top:2px;">${formatCurrency(invoice.total, invoice.currency)}</div>
            `} />
          </Column>
        </Row>
        <Row>
          <Column padding="8px 0 0">
            <Html html={`
              <div style="font-size:12px;color:#6b7280;">Customer</div>
              <div style="font-size:13px;color:#374151;margin-top:2px;">${customer.name}</div>
              <div style="font-size:13px;color:#374151;">${customer.email}</div>
            `} />
          </Column>
        </Row>
      </Column>
    </Row>
  );
}
