#!/usr/bin/env node

const API_URL = process.argv[2] || 'http://localhost:3001';
const CUSTOMER_EMAIL = process.argv[3] || 'billing@acme.com';

const endpoints = [
  'https://api.acme.com/v1/orders',
  'https://api.acme.com/v1/users',
  'https://api.acme.com/v1/products',
  'https://api.acme.com/v1/analytics',
  'https://api.acme.com/v1/search',
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDailyCallCounts() {
  const counts = [];
  const startDate = new Date('2026-06-01T00:00:00.000Z');

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + i);
    const dayOfWeek = date.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? randomBetween(4000, 7000) : randomBetween(7500, 12000);
    const spike = Math.random() < 0.1 ? randomBetween(2000, 5000) : 0;

    counts.push({
      date: date.toISOString().split('T')[0],
      count: base + spike,
    });
  }

  return counts;
}

function generateCallRecords(dailyCounts) {
  const records = [];

  for (const day of dailyCounts) {
    const sampleSize = Math.min(3, Math.ceil(day.count / 3000));

    for (let j = 0; j < sampleSize; j++) {
      const hour = randomBetween(8, 22);
      const minute = randomBetween(0, 59);
      const second = randomBetween(0, 59);
      const endpoint = endpoints[randomBetween(0, endpoints.length - 1)];
      const baseLatency = endpoint.includes('search') ? 280 : 150;
      const responseTimeMs = baseLatency + randomBetween(-50, 200);

      records.push({
        timestamp: `${day.date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.000Z`,
        endpoint,
        responseTimeMs: Math.max(40, responseTimeMs),
      });
    }
  }

  return records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function buildPayload() {
  const dailyCallCounts = generateDailyCallCounts();
  const callRecords = generateCallRecords(dailyCallCounts);
  const totalCalls = dailyCallCounts.reduce((sum, d) => sum + d.count, 0);
  const allLatencies = callRecords.map((r) => r.responseTimeMs);
  const avgLatency = Math.round(allLatencies.reduce((s, v) => s + v, 0) / allLatencies.length);
  const sortedLatencies = [...allLatencies].sort((a, b) => a - b);
  const p95Latency = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || avgLatency;

  return {
    customer: {
      name: 'Acme Corp',
      email: CUSTOMER_EMAIL,
      accountId: '550e8400-e29b-41d4-a716-446655440000',
    },
    invoice: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      period: {
        start: '2026-06-01T00:00:00.000Z',
        end: '2026-07-01T00:00:00.000Z',
      },
      currency: 'USD',
      lineItems: [
        { description: 'API Calls', quantity: totalCalls, rate: 0.0002, amount: parseFloat((totalCalls * 0.0002).toFixed(2)) },
        { description: 'Storage (GB)', quantity: 150, rate: 0.10, amount: 15.00 },
        { description: 'Overage Charges', quantity: 1, rate: 12.50, amount: 12.50 },
      ],
      subtotal: parseFloat((totalCalls * 0.0002 + 15.00 + 12.50).toFixed(2)),
      tax: parseFloat(((totalCalls * 0.0002 + 15.00 + 12.50) * 0.08).toFixed(2)),
      total: parseFloat(((totalCalls * 0.0002 + 15.00 + 12.50) * 1.08).toFixed(2)),
    },
    usage: {
      dailyCallCounts,
      latency: {
        average: avgLatency,
        p95: p95Latency,
      },
      callRecords,
    },
  };
}

async function main() {
  const payload = buildPayload();

  console.log(`\nSending webhook to ${API_URL}/webhook/invoice`);
  console.log(`Customer: ${payload.customer.name} (${payload.customer.email})`);
  console.log(`Total: $${payload.invoice.total}`);
  console.log(`Usage: ${payload.usage.dailyCallCounts.length} days, ${payload.usage.callRecords.length} call records\n`);

  try {
    const res = await fetch(`${API_URL}/webhook/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Webhook failed:', data);
      process.exit(1);
    }

    console.log('Webhook processed successfully!\n');
    console.log(`Portal:       ${data.portalUrl}`);
    console.log(`PDF:          ${API_URL}${data.pdfUrl}`);
    console.log(`Email preview: ${API_URL}/email/${data.invoiceId}/preview\n`);
  } catch (err) {
    console.error('Failed to reach server:', err.message);
    process.exit(1);
  }
}

main();
