type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const argsStr = args.length > 0
      ? ` ${args
          .map((a) => (a instanceof Error ? a.stack || a.message : JSON.stringify(a)))
          .join(' ')}`
      : '';
    return `${prefix} ${message}${argsStr}`;
  }

  debug(message: string, ...args: unknown[]): void {
    console.debug(this.formatMessage('debug', message, ...args));
  }

  info(message: string, ...args: unknown[]): void {
    console.info(this.formatMessage('info', message, ...args));
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('warn', message, ...args));
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage('error', message, ...args));
  }
}

export const logger = new Logger();
