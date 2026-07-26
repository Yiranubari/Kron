import { Row, Column, Html } from '@unlayer/react-elements';
import type { InvoiceLatencyStats } from '../../invoice/entities/invoice.entity.js';

type Props = {
  stats: InvoiceLatencyStats;
};

export function LatencyStats({ stats }: Props) {
  return (
    <Row>
      <Column padding="12px" backgroundColor="#f0f9ff" borderRadius="8px">
        <Html html={`<div style="font-size:14px;font-weight:bold;color:#1e40af;">Latency (ms)</div>`} />
      </Column>
      <Column padding="12px" backgroundColor="#f0f9ff" borderRadius="8px">
        <Html html={`
          <div style="font-size:11px;color:#6b7280;text-align:center;">Average</div>
          <div style="font-size:18px;font-weight:bold;color:#1e40af;text-align:center;">${stats.average}</div>
        `} />
      </Column>
      <Column padding="12px" backgroundColor="#f0f9ff" borderRadius="8px">
        <Html html={`
          <div style="font-size:11px;color:#6b7280;text-align:center;">P95</div>
          <div style="font-size:18px;font-weight:bold;color:#1e40af;text-align:center;">${stats.p95}</div>
        `} />
      </Column>
    </Row>
  );
}
