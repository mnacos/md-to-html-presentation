import { getExitCode } from './exit-codes.js';

/**
 * Enhanced error handler with detailed error messages and suggested fixes
 * 
 * Provides:
 * - Context-rich error messages
 * - Suggested fixes for common errors
 * - Error categorization for proper exit codes
 * - Verbose/debug mode support
 */
export class EnhancedErrorHandler {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Create a detailed error message with context and suggested fixes
   * @param {string} errorCode - Error code
   * @param {string} message - Error message
   * @param {Object} context - Additional context
   * @returns {Object} Detailed error object
   */
  createError(errorCode, message, context = {}) {
    const errorContext = {
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      ...context
    };

    const suggestedFix = this.getSuggestedFix(errorCode, context);

    return {
      ...errorContext,
      suggestedFix,
      exitCode: getExitCode(errorCode)
    };
  }

  /**
   * Get suggested fix based on error code
   * @param {string} errorCode - Error code
   * @param {Object} context - Error context
   * @returns {string} Suggested fix
   */
  getSuggestedFix(errorCode, context = {}) {
    const fixes = {
      'MANIFEST_NOT_FOUND': `Create a manifest.yaml file in the project root with the following structure:\n\nslides:\n  - path: content/architecture\n    order: 1\n    title: "Architecture"\n  - path: content/systems\n    order: 2\n    title: "Systems"`,
      
      'INVALID_MANIFEST_STRUCTURE': 'Ensure your manifest.yaml contains a "slides" array. Each slide should have at least a "path" property.',
      
      'DIRECTORY_NOT_FOUND': `Check that the directory "${context.directory || 'N/A'}" exists. Create it or update the manifest path.`,
      
      'DUPLICATE_ORDER': `Each slide must have a unique order number. Review your manifest.yaml and ensure no two slides have the same order value.`,
      
      'FILE_NOT_FOUND': `Check that the file "${context.filePath || 'N/A'}" exists and the path is correct.`,
      
      'FRONTMATTER_PARSE_ERROR': 'Ensure your YAML frontmatter is properly formatted with valid YAML syntax.',
      
      'FRONTMATTER_VALIDATION_ERROR': `Add the required fields to your frontmatter:\n---\ntitle: "Your Title"\ndescription: "Your description"\n---`,
      
      'DIAGRAM_SYNTAX_ERROR': `Check your Mermaid diagram syntax. Common issues:\n- Missing arrow definitions (-->)\n- Unclosed brackets []\n- Invalid node names`,
      
      'ASSET_NOT_FOUND': `Verify that the image file "${context.filePath || 'N/A'}" exists in the specified location.`,
      
      'ASSET_TOO_LARGE': `The file "${context.filePath || 'N/A'}" exceeds the 5MB size limit. Compress the image or use a smaller file.`,
      
      'ASSET_UNSUPPORTED_FORMAT': `Supported image formats are: PNG, JPG, JPEG, SVG. Convert your image to one of these formats.`,
      
      'BUILD_OUTPUT_ERROR': 'Check that you have write permissions to the output directory and sufficient disk space.',
      
      'UNKNOWN': 'Check the error details above and ensure all dependencies are installed correctly.'
    };

    return fixes[errorCode] || fixes['UNKNOWN'];
  }

  /**
   * Handle an error with detailed context
   * @param {Error} error - Original error
   * @param {string} message - Error message
   * @param {string} errorCode - Error code
   * @param {Object} context - Additional context
   * @returns {Object} Enhanced error object
   */
  handle(error, message, errorCode = 'UNKNOWN_ERROR', context = {}) {
    const enhancedError = this.createError(errorCode, message, {
      ...context,
      originalError: error.message,
      stack: this.verbose ? error.stack : undefined
    });

    this.errors.push(enhancedError);

    this.printError(enhancedError);

    return enhancedError;
  }

  /**
   * Print error to console with formatting
   * @param {Object} error - Enhanced error object
   */
  printError(error) {
    console.error('\n\x1b[31m✖ Error:\x1b[0m');
    console.error(`  Code: ${error.errorCode}`);
    console.error(`  Message: ${error.message}`);
    
    if (error.originalError) {
      console.error(`  Details: ${error.originalError}`);
    }

    if (this.verbose && error.stack) {
      console.error('\n  Stack trace:');
      error.stack.split('\n').forEach(line => console.error(`    ${line}`));
    }

    if (error.suggestedFix) {
      console.error('\n\x1b[33m💡 Suggested fix:\x1b[0m');
      error.suggestedFix.split('\n').forEach(line => console.error(`    ${line}`));
    }
    console.error('');
  }

  /**
   * Handle a warning without throwing
   * @param {string} message - Warning message
   * @param {string} code - Warning code
   * @param {Object} context - Additional context
   */
  warn(message, code = 'WARNING', context = {}) {
    const warning = {
      code,
      message,
      context,
      timestamp: new Date().toISOString()
    };

    this.warnings.push(warning);

    console.warn(`\n\x1b[33m⚠ Warning [${code}]:\x1b[0m ${message}`);
  }

  /**
   * Log verbose message
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.verbose) {
      console.log(`\x1b[90mℹ ${message}\x1b[0m`);
    }
  }

  /**
   * Get all collected errors
   * @returns {Array} Array of errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get all collected warnings
   * @returns {Array} Array of warnings
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Check if any errors occurred
   * @returns {boolean} True if errors exist
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Clear all collected errors and warnings
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Get the appropriate exit code based on errors
   * @returns {number} Exit code
   */
  getExitCode() {
    if (this.errors.length === 0) {
      return 0;
    }

    // Check if any error is a config error
    const hasConfigError = this.errors.some(err => err.exitCode === 2);
    return hasConfigError ? 2 : 1;
  }
}

export default EnhancedErrorHandler;
