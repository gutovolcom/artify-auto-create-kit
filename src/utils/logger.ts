
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  function?: string;
  data?: any;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = this.getLevelPrefix(level);
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `${timestamp} ${prefix} ${message}${contextStr}`;
  }

  private getLevelPrefix(level: LogLevel): string {
    const prefixes = {
      debug: '🔍 [DEBUG]',
      info: 'ℹ️ [INFO]',
      warn: '⚠️ [WARN]',
      error: '💥 [ERROR]'
    };
    return prefixes[level];
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage('error', message, context));
  }

  // Specialized logging methods for common patterns
  canvasOperation(operation: string, data?: any) {
    this.debug(`Canvas operation: ${operation}`, { component: 'Canvas', data });
  }

  formValidation(field: string, isValid: boolean, errors?: any) {
    this.debug(`Form validation: ${field}`, { 
      component: 'Form', 
      isValid, 
      errors 
    });
  }

  apiCall(endpoint: string, method: string, data?: any) {
    this.info(`API call: ${method} ${endpoint}`, { 
      component: 'API', 
      data 
    });
  }

  stateUpdate(component: string, state: string, value?: any) {
    this.debug(`State update: ${component}.${state}`, { 
      component, 
      state, 
      value 
    });
  }
}

export const logger = new Logger();
