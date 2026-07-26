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
  const barMaxHeight = compact ? 60 : 120;
  const cellWidth = `${Math.floor(100 / data.length)}%`;

  const barsHtml = data.map((day) => {
    const barHeight = Math.round((day.count / maxCount) * barMaxHeight);
    const barColor = day.count > maxCount * 0.8 ? '#ef4444'
      : day.count > maxCount * 0.5 ? '#f59e0b'
      : '#22c55e';

    return `
      <td style="width:${cellWidth};padding:2px;vertical-align:bottom;text-align:center;">
        <div style="font-size:${compact ? '9px' : '11px'};color:#6b7280;margin-bottom:2px;">${day.count}</div>
        <div style="height:${barHeight}px;background-color:${barColor};border-radius:3px 3px 0 0;min-height:4px;margin:0 auto;width:80%;"></div>
        <div style="font-size:${compact ? '8px' : '10px'};color:#9ca3af;padding-top:4px;">${formatDate(day.date)}</div>
      </td>
    `;
  }).join('');

  return (
    <Row>
      <Column padding="10px 0">
        <Html html={`<strong style="font-size:14px;color:#111827;">Daily API Calls</strong>`} />
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
