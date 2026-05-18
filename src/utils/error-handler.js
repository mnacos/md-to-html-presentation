export class ErrorHandler {
  constructor() {
    this.errors = [];
  }

  /**
   * Handle an error with a custom message
   * @param {Error} error - The error to handle
   * @param {string} message - Custom error message
   * @param {string} code - Error code
   */
  handle(error, message = 'An error occurred', code = 'UNKNOWN_ERROR') {
    const handledError = new Error(`[${code}] ${message}: ${error.message}`);
    handledError.code = code;
    handledError.originalError = error;
    
    this.errors.push(handledError);
    
    if (process.env.DEBUG === 'true') {
      console.error('Debug Info:', {
        message,
        error: error.message,
        stack: error.stack
      });
    }
    
    throw handledError;
  }

  /**
   * Handle a warning without throwing
   * @param {string} message - Warning message
   * @param {string} code - Warning code
   */
  warn(message, code = 'WARNING') {
    console.warn(`[${code}] ${message}`);
  }

  /**
   * Validate that a value is not null or undefined
   * @param {*} value - Value to check
   * @param {string} paramName - Name of the parameter
   */
  validateNotNull(value, paramName) {
    if (value === null || value === undefined) {
      this.handle(
        new Error(`${paramName} is required`),
        `Missing required parameter: ${paramName}`,
        'MISSING_PARAMETER'
      );
    }
  }

  /**
   * Validate that a file path exists
   * @param {string} filePath - File path to check
   */
  async validateFileExists(filePath) {
    const fs = await import('fs');
    const path = await import('path');
    
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(absolutePath)) {
      this.handle(
        new Error(`File not found: ${filePath}`),
        `File does not exist: ${filePath}`,
        'FILE_NOT_FOUND'
      );
    }
    
    return absolutePath;
  }

  /**
   * Validate directory exists, create if not
   * @param {string} dirPath - Directory path
   */
  async ensureDirectory(dirPath) {
    const fs = await import('fs');
    const path = await import('path');
    
    const absolutePath = path.isAbsolute(dirPath)
      ? dirPath
      : path.resolve(process.cwd(), dirPath);

    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }

    return absolutePath;
  }

  /**
   * Get all collected errors
   * @returns {Array} Array of errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear all collected errors
   */
  clear() {
    this.errors = [];
  }
}
