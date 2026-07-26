import { describe, it, expect } from 'vitest';
import { EmailService } from '../../../src/infrastructure/email.service.js';

describe('EmailService', () => {
  it('throws with invalid API key', async () => {
    const service = new EmailService('not-a-real-key');

    await expect(service.send('test@example.com', 'Subject', '<html></html>')).rejects.toThrow();
  });

  it('accepts a valid-looking API key', () => {
    const service = new EmailService('re_123456789');

    expect(service).toBeDefined();
  });
});
