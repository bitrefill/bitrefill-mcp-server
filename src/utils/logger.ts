type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  method?: string;
  [key: string]: any;
}

export default class Logger {
  private static formatMessage(level: LogLevel, message: string, context: LogContext = {}): string {
    const timestamp = new Date().toISOString();
    const moduleInfo = context.module ? `[${context.module}]` : '';
    const methodInfo = context.method ? `[${context.method}]` : '';
    const contextStr = Object.entries(context)
      .filter(([key]) => !['module', 'method'].includes(key))
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');
    
    return `${timestamp} ${level.toUpperCase()} ${moduleInfo}${methodInfo} ${message} ${contextStr}`.trim();
  }

  static debug(message: string, context: LogContext = {}): void {
    console.debug(this.formatMessage('debug', message, context));
  }

  static info(message: string, context: LogContext = {}): void {
    console.info(this.formatMessage('info', message, context));
  }

  static warn(message: string, context: LogContext = {}): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  static error(message: string, error?: Error, context: LogContext = {}): void {
    const errorContext = error ? {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    } : context;
    
    console.error(this.formatMessage('error', message, errorContext));
  }
} 