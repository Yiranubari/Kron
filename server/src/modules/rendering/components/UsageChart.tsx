import { Row, Column, Html } from '@unlayer/react-elements';
import type { InvoiceDailyCallCount } from '../../invoice/entities/invoice.entity.js';

type Props = {
  data: InvoiceDailyCallCount[];
  compact?: boolean;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function UsageChart({ data, compact }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barMaxHeight = compact ? 40 : 80;
  const cellWidth = `${Math.floor(100 / data.length)}%`;

  const barsHtml = data.map((day) => {
    const barHeight = Math.round((day.count / maxCount) * barMaxHeight);

    return `
      <td style="width:${cellWidth};padding:1px;vertical-align:bottom;text-align:center;">
        <div style="height:${barHeight}px;background-color:#8b9fba;border-radius:2px 2px 0 0;min-height:2px;margin:0 auto;width:70%;"></div>
      </td>
    `;
  }).join('');

  return (
    <Row>
      <Column padding={compact ? '8px 0' : '12px 0'}>
        <Html html={`<div style="font-size:12px;font-weight:600;color:#d0d0d8;letter-spacing:0.02em;">DAILY API CALLS</div>`} />
      </Column>
      <Column padding="0">
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>{barsHtml}</tr>
          </tbody>
        </table>
      </Column>
    </Row>
  );
}
