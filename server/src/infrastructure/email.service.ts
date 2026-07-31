import { EmailSendException } from "../exceptions/app-exceptions.js";

const ELASTIC_EMAIL_API_URL = "https://api.elasticemail.com/v4/emails";
const REQUEST_TIMEOUT_MS = 15000;
export class EmailService {
  constructor(
    private readonly smtpHost: string,
    private readonly smtpPort: number,
    private readonly smtpEncryption: string,
    private readonly smtpUser: string,
    private readonly smtpPass: string,
    private readonly fromEmail: string,
    private readonly fromName: string,
  ) {}

  async send(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    if (!this.smtpPass) {
      throw new EmailSendException("Elastic Email API key is not configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(ELASTIC_EMAIL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ElasticEmail-ApiKey": this.smtpPass,
        },
        body: JSON.stringify({
          Recipients: [{ Email: to }],
          Content: {
            From: this.fromEmail,
            FromName: this.fromName,
            Subject: subject,
            Body: [
              { ContentType: "HTML", Content: html },
              { ContentType: "PlainText", Content: text },
            ],
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Elastic Email API returned ${response.status}: ${body}`,
        );
      }
    } catch (err) {
      throw new EmailSendException(
        "Failed to send email",
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
