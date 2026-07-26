import nodemailer from 'nodemailer';
import { EmailSendException } from '../exceptions/app-exceptions.js';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly smtpHost: string,
    private readonly smtpPort: number,
    private readonly smtpEncryption: string,
    private readonly smtpUser: string,
    private readonly smtpPass: string,
    private readonly fromEmail: string,
    private readonly fromName: string,
  ) {
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpEncryption === 'ssl',
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  async send(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
        text,
      });
    } catch (err) {
      throw new EmailSendException(
        'Failed to send email',
        err instanceof Error ? err.message : undefined,
      );
    }
  }
}
