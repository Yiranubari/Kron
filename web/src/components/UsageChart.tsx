import type { DailyCallCount } from '../api/client';
import './UsageChart.css';

type Props = {
  data: DailyCallCount[];
};

function formatShortDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
}

export function UsageChart({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalCalls = data.reduce((sum, d) => sum + d.count, 0);

  const firstLabel = data[0] ? formatShortDate(data[0].date) : '';
  const lastLabel = data[data.length - 1] ? formatShortDate(data[data.length - 1]!.date) : '';

  return (
    <section className="usage-chart" id="usage-chart">
      <div className="usage-chart__header">
        <div>
          <p className="usage-chart__title">Daily API calls</p>
          <p className="usage-chart__subtitle">Last {data.length} days</p>
        </div>
        <div>
          <p className="usage-chart__total">{formatNumber(totalCalls)}</p>
          <p className="usage-chart__total-label">total calls</p>
        </div>
      </div>

      <div className="usage-chart__bars">
        {data.map((day) => {
          const height = Math.round((day.count / maxCount) * 100);

          return (
            <div key={day.date} className="usage-chart__bar-wrapper">
              <span className="usage-chart__tooltip">
                {formatShortDate(day.date)}: {day.count.toLocaleString()}
              </span>
              <div
                className="usage-chart__bar"
                style={{ height: `${Math.max(height, 3)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="usage-chart__axis">
        <span className="usage-chart__axis-label">{firstLabel}</span>
        <span className="usage-chart__axis-label">{lastLabel}</span>
      </div>
    </section>
  );
}
