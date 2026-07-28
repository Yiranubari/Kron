import { useState } from 'react';
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalCalls = data.reduce((sum, d) => sum + d.count, 0);
  const avgCalls = Math.round(totalCalls / data.length);

  const firstLabel = data[0] ? formatShortDate(data[0].date) : '';
  const lastLabel = data[data.length - 1] ? formatShortDate(data[data.length - 1]!.date) : '';

  const third = Math.max(1, Math.floor(data.length / 3));
  const midLabel1 = data[third] ? formatShortDate(data[third]!.date) : '';
  const midLabel2 = data[Math.min(third * 2, data.length - 1)] ? formatShortDate(data[Math.min(third * 2, data.length - 1)]!.date) : '';

  return (
    <section className="usage-chart" id="usage-chart">
      <div className="usage-chart__header">
        <div>
          <p className="usage-chart__title">Daily API calls</p>
          <p className="usage-chart__subtitle">{data.length}-day period</p>
        </div>
        <div className="usage-chart__stats">
          <div className="usage-chart__stat">
            <p className="usage-chart__stat-value">{formatNumber(totalCalls)}</p>
            <p className="usage-chart__stat-label">Total</p>
          </div>
          <div className="usage-chart__stat">
            <p className="usage-chart__stat-value">{formatNumber(avgCalls)}</p>
            <p className="usage-chart__stat-label">Daily avg</p>
          </div>
        </div>
      </div>

      <div className="usage-chart__bars">
        {data.map((day, i) => {
          const height = Math.round((day.count / maxCount) * 100);
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={day.date}
              className="usage-chart__bar-wrapper"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ animationDelay: `${0.35 + i * 0.012}s` }}
            >
              <div className={`usage-chart__tooltip${isHovered ? ' usage-chart__tooltip--visible' : ''}`}>
                <span className="usage-chart__tooltip-date">{formatShortDate(day.date)}</span>
                <span className="usage-chart__tooltip-count">{day.count.toLocaleString()} calls</span>
              </div>
              <div
                className={`usage-chart__bar${isHovered ? ' usage-chart__bar--hovered' : ''}`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="usage-chart__axis">
        <span className="usage-chart__axis-label">{firstLabel}</span>
        <span className="usage-chart__axis-label">{midLabel1}</span>
        <span className="usage-chart__axis-label">{midLabel2}</span>
        <span className="usage-chart__axis-label">{lastLabel}</span>
      </div>
    </section>
  );
}
