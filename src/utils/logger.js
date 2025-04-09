const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    fg: {
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
    },
    
    bg: {
      black: '\x1b[40m',
      red: '\x1b[41m',
      green: '\x1b[42m',
      yellow: '\x1b[43m',
      blue: '\x1b[44m',
      magenta: '\x1b[45m',
      cyan: '\x1b[46m',
      white: '\x1b[47m',
    }
  };
  
  const getTimestamp = () => {
    return new Date().toISOString();
  };
  
  const logger = {
    info: (message) => {
      console.log(`${colors.fg.green}[INFO]${colors.reset} ${getTimestamp()} - ${message}`);
    },
    error: (message) => {
      console.log(`${colors.fg.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`);
    },
    warn: (message) => {
      console.warn(`${colors.fg.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`);
    },
    debug: (message) => {
      console.debug(`${colors.fg.cyan}[DEBUG]${colors.reset} ${getTimestamp()} - ${message}`);
    }
  };
  
  logger.stream = {
    write: (message) => logger.info(message.trim())
  };
  
  export default logger;