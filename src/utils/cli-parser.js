import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * CLI argument parser for the presentation build tool
 * 
 * Provides command-line interface with the following options:
 * - --config: Path to manifest file
 * - --output: Output HTML file path
 * - --content-dir: Content directory path
 * - --verbose: Enable verbose logging
 * - --help: Show help message
 */
export class CliParser {
  /**
   * Parse command-line arguments
   * @returns {Object} Parsed arguments
   */
  static parse() {
    return yargs(hideBin(process.argv))
      .option('config', {
        alias: 'c',
        type: 'string',
        description: 'Path to manifest YAML file (default: manifest.yaml)',
        default: 'manifest.yaml'
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Output HTML file path (default: dist/presentation.html)',
        default: 'dist/presentation.html'
      })
      .option('content-dir', {
        alias: 'd',
        type: 'string',
        description: 'Content directory path (default: content/)',
        default: 'content'
      })
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Enable verbose logging',
        default: false
      })
      .option('help', {
        alias: 'h',
        type: 'boolean',
        description: 'Show help message'
      })
      .usage('Usage: $0 [options]')
      .example('$0', 'Build presentation with default settings')
      .example('$0 --config custom-manifest.yaml', 'Use custom manifest file')
      .example('$0 --output my-presentation.html --verbose', 'Custom output with verbose logging')
      .wrap(yargs().terminalWidth())
      .parseSync();
  }

  /**
   * Validate parsed arguments
   * @param {Object} args - Parsed arguments
   * @returns {Object} Validation result
   */
  static validate(args) {
    const errors = [];

    if (args.config && !args.config.endsWith('.yaml') && !args.config.endsWith('.yml')) {
      errors.push({
        field: 'config',
        message: 'Config file must be a YAML file (.yaml or .yml)',
        suggestedFix: 'Use a .yaml or .yml file extension'
      });
    }

    if (args.output && !args.output.endsWith('.html')) {
      errors.push({
        field: 'output',
        message: 'Output file must be an HTML file (.html)',
        suggestedFix: 'Use a .html file extension'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default CliParser;
