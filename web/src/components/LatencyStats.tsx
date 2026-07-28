import type { LatencyStats as LatencyData } from '../api/client';
import './LatencyStats.css';

type Props = {
  stats: LatencyData;
};

const GOOD_THRESHOLD = 300;
const WARN_THRESHOLD = 800;
const MAX_REASONABLE_MS = 2000;

function status(ms: number): 'good' | 'warn' | 'bad' {
  if (ms < GOOD_THRESHOLD) return 'good';
  if (ms < WARN_THRESHOLD) return 'warn';
  return 'bad';
}

function healthLabel(ms: number): string {
  if (ms < GOOD_THRESHOLD) return 'Healthy';
  if (ms < WARN_THRESHOLD) return 'Degraded';
  return 'Slow';
}

function barWidth(ms: number): number {
  const clamped = Math.min(ms, MAX_REASONABLE_MS);
  return Math.max(10, 100 - (clamped / MAX_REASONABLE_MS) * 70);
}

export function LatencyStats({ stats }: Props) {
  const avgStatus = status(stats.average);
  const p95Status = status(stats.p95);

  return (
    <section className="latency-stats" id="latency-stats">
      <div className="latency-stats__card">
        <div className="latency-stats__card-header">
          <p className="latency-stats__label">
            <span className={`latency-stats__indicator latency-stats__indicator--${avgStatus}`} />
            Avg latency
          </p>
          <span className={`latency-stats__health latency-stats__health--${avgStatus}`}>
            {healthLabel(stats.average)}
          </span>
        </div>
        <p className="latency-stats__value">
          {stats.average}
          <span className="latency-stats__unit">ms</span>
        </p>
        <div className="latency-stats__bar">
          <div
            className={`latency-stats__bar-fill latency-stats__bar-fill--${avgStatus}`}
            style={{ width: `${barWidth(stats.average)}%` }}
          />
        </div>
      </div>

      <div className="latency-stats__card">
        <div className="latency-stats__card-header">
          <p className="latency-stats__label">
            <span className={`latency-stats__indicator latency-stats__indicator--${p95Status}`} />
            P95 latency
          </p>
          <span className={`latency-stats__health latency-stats__health--${p95Status}`}>
            {healthLabel(stats.p95)}
          </span>
        </div>
        <p className="latency-stats__value">
          {stats.p95}
          <span className="latency-stats__unit">ms</span>
        </p>
        <div className="latency-stats__bar">
          <div
            className={`latency-stats__bar-fill latency-stats__bar-fill--${p95Status}`}
            style={{ width: `${barWidth(stats.p95)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
