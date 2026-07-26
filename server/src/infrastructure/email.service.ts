import { Resend } from 'resend';
import { EmailSendException } from '../exceptions/app-exceptions.js';

export class EmailService {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.client.emails.send({
      from: 'Kron Billing <billing@kron.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      throw new EmailSendException(
        'Failed to send email',
        error.message,
      );
    }
  }
}
