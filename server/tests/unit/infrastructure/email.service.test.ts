import { describe, it, expect } from 'vitest';
import { EmailService } from '../../../src/infrastructure/email.service.js';

describe('EmailService', () => {
  it('throws with invalid SMTP credentials', async () => {
    const service = new EmailService(
      'smtp.nonexistent.example.com', 587, 'starttls', 'fake@gmail.com', 'wrongpass', 'fake@gmail.com', 'Test',
    );

    await expect(service.send('test@example.com', 'Subject', '<html></html>', 'Text')).rejects.toThrow();
  });

  it('accepts valid configuration', () => {
    const service = new EmailService(
      'smtp.gmail.com', 465, 'ssl', 'test@gmail.com', 'app-password', 'test@gmail.com', 'Test',
    );

    expect(service).toBeDefined();
  });
});
