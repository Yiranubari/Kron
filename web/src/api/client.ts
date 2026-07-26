export type Customer = {
  name: string;
  email: string;
  accountId: string;
};

export type Period = {
  start: string;
  end: string;
};

export type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceData = {
  id: string;
  period: Period;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
};

export type CallRecord = {
  timestamp: string;
  endpoint: string;
  responseTimeMs: number;
};

export type DailyCallCount = {
  date: string;
  count: number;
};

export type LatencyStats = {
  average: number;
  p95: number;
};

export type UsageData = {
  dailyCallCounts: DailyCallCount[];
  latency: LatencyStats;
  callRecords: CallRecord[];
};

export type PortalData = {
  customer: Customer;
  invoice: InvoiceData;
  usage: UsageData;
};

export async function fetchPortalData(invoiceId: string): Promise<PortalData> {
  const res = await fetch(`/api/portal-data/${invoiceId}`);

  if (!res.ok) {
    throw new Error(String(res.status));
  }

  return res.json() as Promise<PortalData>;
}
