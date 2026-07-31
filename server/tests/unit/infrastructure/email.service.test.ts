import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailService } from '../../../src/infrastructure/email.service.js';

describe('EmailService', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ TransactionID: 'test-tx' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when SMTP is not configured', async () => {
    const service = new EmailService(
      'smtp.elasticemail.com', 2525, 'starttls', '', '', 'billing@kron.dev', 'Kron Billing',
    );

    await expect(service.send('test@example.com', 'Subject', '<html></html>', 'Text')).rejects.toThrow(
      'SMTP is not configured',
    );
  });

  it('sends via the Elastic Email HTTP API', async () => {
    const service = new EmailService(
      'smtp.elasticemail.com', 2525, 'starttls', 'test@kron.dev', 'api-key', 'billing@kron.dev', 'Kron Billing',
    );

    await expect(
      service.send('test@example.com', 'Your Kron invoice is ready', '<h1>Hi</h1>', 'Hi'),
    ).resolves.toBeUndefined();

    const fetchMock = vi.mocked(globalThis.fetch);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe('https://api.elasticemail.com/v4/emails');
    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>)['X-ElasticEmail-ApiKey']).toBe('api-key');

    const body = JSON.parse(init?.body as string);
    expect(body.Recipients.To).toEqual([{ Email: 'test@example.com' }]);
    expect(body.Content.From).toBe('billing@kron.dev');
    expect(body.Content.FromName).toBe('Kron Billing');
    expect(body.Content.Subject).toBe('Your Kron invoice is ready');
    expect(body.Content.Body).toEqual([
      { ContentType: 'HTML', Content: '<h1>Hi</h1>' },
      { ContentType: 'PlainText', Content: 'Hi' },
    ]);
  });

  it('wraps non-2xx API responses as a send failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'Invalid API key' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const service = new EmailService(
      'smtp.elasticemail.com', 2525, 'starttls', 'test@kron.dev', 'bad-key', 'billing@kron.dev', 'Kron Billing',
    );

    await expect(service.send('test@example.com', 'Subject', '<html></html>', 'Text')).rejects.toThrow(
      'Failed to send email',
    );
  });

  it('wraps network errors as a send failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('fetch failed: connection refused')),
    );

    const service = new EmailService(
      'smtp.elasticemail.com', 2525, 'starttls', 'test@kron.dev', 'api-key', 'billing@kron.dev', 'Kron Billing',
    );

    await expect(service.send('test@example.com', 'Subject', '<html></html>', 'Text')).rejects.toThrow(
      'Failed to send email',
    );
  });

  it('accepts valid configuration', () => {
    const service = new EmailService(
      'smtp.elasticemail.com', 2525, 'starttls', 'test@kron.dev', 'api-key', 'billing@kron.dev', 'Kron Billing',
    );

    expect(service).toBeDefined();
  });
});
