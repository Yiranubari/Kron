import puppeteer from 'puppeteer';
import { PdfConversionException } from '../exceptions/app-exceptions.js';

export class PdfConverter {
  async convert(html: string): Promise<Buffer> {
    let browser;

    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } catch (err) {
      throw new PdfConversionException(
        'Failed to generate PDF',
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
