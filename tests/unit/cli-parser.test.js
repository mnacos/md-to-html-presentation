/**
 * Unit tests for CliParser
 */

import CliParser from '../../src/utils/cli-parser.js';

describe('CliParser', () => {
  describe('parse', () => {
    it('should parse default arguments', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'build.js'];
      
      const args = CliParser.parse();
      
      expect(args.config).toBe('manifest.yaml');
      expect(args.output).toBe('dist/presentation.html');
      expect(args['content-dir']).toBe('content');
      expect(args.verbose).toBe(false);
      
      process.argv = originalArgv;
    });

    it('should parse custom config argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'build.js', '--config', 'custom.yaml'];
      
      const args = CliParser.parse();
      
      expect(args.config).toBe('custom.yaml');
      
      process.argv = originalArgv;
    });

    it('should parse verbose flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'build.js', '--verbose'];
      
      const args = CliParser.parse();
      
      expect(args.verbose).toBe(true);
      
      process.argv = originalArgv;
    });

    it('should parse output argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'build.js', '--output', 'my-output.html'];
      
      const args = CliParser.parse();
      
      expect(args.output).toBe('my-output.html');
      
      process.argv = originalArgv;
    });

    it('should parse content-dir argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'build.js', '--content-dir', 'my-content'];
      
      const args = CliParser.parse();
      
      expect(args['content-dir']).toBe('my-content');
      
      process.argv = originalArgv;
    });

    it('should parse all arguments together', () => {
      const originalArgv = process.argv;
      process.argv = [
        'node', 'build.js',
        '--config', 'custom.yaml',
        '--output', 'output.html',
        '--content-dir', 'slides',
        '--verbose'
      ];
      
      const args = CliParser.parse();
      
      expect(args.config).toBe('custom.yaml');
      expect(args.output).toBe('output.html');
      expect(args['content-dir']).toBe('slides');
      expect(args.verbose).toBe(true);
      
      process.argv = originalArgv;
    });
  });

  describe('validate', () => {
    it('should validate correct arguments', () => {
      const args = {
        config: 'manifest.yaml',
        output: 'dist/presentation.html',
        'content-dir': 'content',
        verbose: false
      };
      
      const result = CliParser.validate(args);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-yaml config file', () => {
      const args = {
        config: 'manifest.json',
        output: 'dist/presentation.html'
      };
      
      const result = CliParser.validate(args);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('config');
      expect(result.errors[0].suggestedFix).toContain('.yaml');
    });

    it('should reject non-html output file', () => {
      const args = {
        config: 'manifest.yaml',
        output: 'dist/output.txt'
      };
      
      const result = CliParser.validate(args);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('output');
      expect(result.errors[0].suggestedFix).toContain('.html');
    });

    it('should accept yml extension for config', () => {
      const args = {
        config: 'manifest.yml',
        output: 'dist/presentation.html'
      };
      
      const result = CliParser.validate(args);
      
      expect(result.isValid).toBe(true);
    });
  });
});
