import { Row, Column, Html } from '@unlayer/react-elements';
import type { InvoiceLatencyStats } from '../../invoice/entities/invoice.entity.js';

type Props = {
  stats: InvoiceLatencyStats;
};

function indicatorColor(ms: number): string {
  if (ms < 300) return '#4ade80';
  if (ms < 800) return '#fbbf24';
  return '#f87171';
}

export function LatencyStats({ stats }: Props) {
  const avgColor = indicatorColor(stats.average);
  const p95Color = indicatorColor(stats.p95);

  return (
    <Row>
      <Column padding="16px" backgroundColor="#1a1a20" borderRadius="10px">
        <Html html={`
          <div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:#6a6a7a;margin-bottom:8px;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${avgColor};margin-right:6px;vertical-align:middle;"></span>
            Avg latency
          </div>
          <div style="font-size:22px;font-weight:600;color:#f0f0f4;letter-spacing:-0.02em;">${stats.average}<span style="font-size:12px;font-weight:300;color:#a0a0b0;margin-left:2px;">ms</span></div>
        `} />
      </Column>
      <Column padding="16px" backgroundColor="#1a1a20" borderRadius="10px">
        <Html html={`
          <div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;color:#6a6a7a;margin-bottom:8px;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${p95Color};margin-right:6px;vertical-align:middle;"></span>
            P95 latency
          </div>
          <div style="font-size:22px;font-weight:600;color:#f0f0f4;letter-spacing:-0.02em;">${stats.p95}<span style="font-size:12px;font-weight:300;color:#a0a0b0;margin-left:2px;">ms</span></div>
        `} />
      </Column>
    </Row>
  );
}
