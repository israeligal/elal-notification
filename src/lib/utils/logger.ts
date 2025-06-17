import { Logtail } from '@logtail/node';

const { NODE_ENV, LOGTAIL_TOKEN } = process.env;

const isFullLogger = NODE_ENV === 'production';

// Create the Logtail instance for production
const logtail = new Logtail(LOGTAIL_TOKEN ?? '', {
  sendLogsToConsoleOutput: !isFullLogger, // We'll handle console output ourselves
  endpoint: 'https://s1349170.eu-nbg-2.betterstackdata.com',
});

// Single logger that switches behavior based on environment
export const logger = {
  info: (message: string, context?: object) => {
    if (isFullLogger) {
      logtail.info(message, context);
    } else {
      console.log(`[INFO] ${message}`);
    }
  },
  
  warn: (message: string, context?: object) => {
    if (isFullLogger) {
      logtail.warn(message, context);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  
  error: (message: string, context?: object) => {
    if (isFullLogger) {
      logtail.error(message, context);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  
  debug: (message: string, context?: object) => {
    if (isFullLogger) {
      logtail.debug(message, context);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  }
};
