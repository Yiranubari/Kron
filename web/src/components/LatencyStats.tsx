import type { LatencyStats as LatencyData } from '../api/client';
import './LatencyStats.css';

type Props = {
  stats: LatencyData;
};

function indicator(ms: number): string {
  if (ms < 300) return 'latency-stats__indicator--good';
  if (ms < 800) return 'latency-stats__indicator--warn';
  return 'latency-stats__indicator--bad';
}

export function LatencyStats({ stats }: Props) {
  return (
    <section className="latency-stats" id="latency-stats">
      <div className="latency-stats__card">
        <p className="latency-stats__label">
          <span className={`latency-stats__indicator ${indicator(stats.average)}`} />
          Avg latency
        </p>
        <p className="latency-stats__value">
          {stats.average}
          <span className="latency-stats__unit">ms</span>
        </p>
      </div>

      <div className="latency-stats__card">
        <p className="latency-stats__label">
          <span className={`latency-stats__indicator ${indicator(stats.p95)}`} />
          P95 latency
        </p>
        <p className="latency-stats__value">
          {stats.p95}
          <span className="latency-stats__unit">ms</span>
        </p>
      </div>
    </section>
  );
}
