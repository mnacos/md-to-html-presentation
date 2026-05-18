/**
 * Unit tests for EnhancedErrorHandler
 */

import { EnhancedErrorHandler } from '../../src/utils/enhanced-error-handler.js';

describe('EnhancedErrorHandler', () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new EnhancedErrorHandler({ verbose: false });
  });

  describe('constructor', () => {
    it('should initialize with verbose false by default', () => {
      const handler = new EnhancedErrorHandler();
      expect(handler.verbose).toBe(false);
      expect(handler.errors).toHaveLength(0);
      expect(handler.warnings).toHaveLength(0);
    });

    it('should initialize with verbose true when specified', () => {
      const handler = new EnhancedErrorHandler({ verbose: true });
      expect(handler.verbose).toBe(true);
    });
  });

  describe('createError', () => {
    it('should create error object with all fields', () => {
      const error = errorHandler.createError('TEST_ERROR', 'Test message', { extra: 'data' });
      
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.extra).toBe('data');
      expect(error.suggestedFix).toBeDefined();
      expect(error.exitCode).toBeDefined();
      expect(error.timestamp).toBeDefined();
    });

    it('should provide suggested fix for known error codes', () => {
      const error = errorHandler.createError('MANIFEST_NOT_FOUND', 'Manifest not found');
      
      expect(error.suggestedFix).toContain('manifest.yaml');
    });

    it('should return exit code 2 for config errors', () => {
      const error = errorHandler.createError('DIRECTORY_NOT_FOUND', 'Directory not found');
      
      expect(error.exitCode).toBe(2);
    });

    it('should return exit code 1 for build errors', () => {
      const error = errorHandler.createError('BUILD_ERROR', 'Build failed');
      
      expect(error.exitCode).toBe(1);
    });
  });

  describe('handle', () => {
    it('should handle an error and add to errors array', () => {
      const error = new Error('Original error');
      const result = errorHandler.handle(error, 'Test message', 'TEST_ERROR');
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(result.errorCode).toBe('TEST_ERROR');
    });

   it('should print error to console', () => {
      const originalError = console.error;
      let called = false;
      console.error = () => { called = true; };
      
      const error = new Error('Test');
      errorHandler.handle(error, 'Test message', 'TEST_ERROR');
      
      expect(called).toBe(true);
      
      console.error = originalError;
    });

    it('should return enhanced error with exit code', () => {
      const error = new Error('Test');
      const result = errorHandler.handle(error, 'Test', 'DIRECTORY_NOT_FOUND');
      
      expect(result.exitCode).toBe(2);
    });
  });

  describe('warn', () => {
    it('should add warning to warnings array', () => {
      const originalWarn = console.warn;
      console.warn = () => {};
      
      errorHandler.warn('Test warning', 'TEST_WARNING');
      
      expect(errorHandler.warnings).toHaveLength(1);
      expect(errorHandler.warnings[0].code).toBe('TEST_WARNING');
      
      console.warn = originalWarn;
    });

    it('should use default warning code', () => {
      errorHandler.warn('Test warning');
      
      expect(errorHandler.warnings[0].code).toBe('WARNING');
    });
  });

  describe('log', () => {
    it('should not log when verbose is false', () => {
      const originalLog = console.log;
      let called = false;
      console.log = () => { called = true; };
      
      errorHandler.log('Test log');
      
      expect(called).toBe(false);
      
      console.log = originalLog;
    });

    it('should log when verbose is true', () => {
      errorHandler.verbose = true;
      const originalLog = console.log;
      let called = false;
      console.log = () => { called = true; };
      
      errorHandler.log('Test log');
      
      expect(called).toBe(true);
      
      console.log = originalLog;
    });
  });

  describe('getErrors', () => {
    it('should return all errors', () => {
      errorHandler.handle(new Error('E1'), 'Error 1', 'ERROR_1');
      errorHandler.handle(new Error('E2'), 'Error 2', 'ERROR_2');
      
      const errors = errorHandler.getErrors();
      
      expect(errors).toHaveLength(2);
    });
  });

  describe('getWarnings', () => {
    it('should return all warnings', () => {
      errorHandler.warn('Warning 1');
      errorHandler.warn('Warning 2');
      
      const warnings = errorHandler.getWarnings();
      
      expect(warnings).toHaveLength(2);
    });
  });

  describe('hasErrors', () => {
    it('should return false when no errors', () => {
      expect(errorHandler.hasErrors()).toBe(false);
    });

    it('should return true when errors exist', () => {
      errorHandler.handle(new Error('E1'), 'Error 1', 'ERROR_1');
      expect(errorHandler.hasErrors()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all errors and warnings', () => {
      errorHandler.handle(new Error('E1'), 'Error 1', 'ERROR_1');
      errorHandler.warn('Warning 1');
      
      errorHandler.clear();
      
      expect(errorHandler.errors).toHaveLength(0);
      expect(errorHandler.warnings).toHaveLength(0);
    });
  });

  describe('getExitCode', () => {
    it('should return 0 when no errors', () => {
      expect(errorHandler.getExitCode()).toBe(0);
    });

    it('should return 1 for build errors', () => {
      errorHandler.handle(new Error('E1'), 'Error 1', 'BUILD_ERROR');
      expect(errorHandler.getExitCode()).toBe(1);
    });

    it('should return 2 for config errors', () => {
      errorHandler.handle(new Error('E1'), 'Error 1', 'DIRECTORY_NOT_FOUND');
      expect(errorHandler.getExitCode()).toBe(2);
    });

    it('should return 2 if any error is config error', () => {
      errorHandler.handle(new Error('E1'), 'Error 1', 'BUILD_ERROR');
      errorHandler.handle(new Error('E2'), 'Error 2', 'DIRECTORY_NOT_FOUND');
      expect(errorHandler.getExitCode()).toBe(2);
    });
  });

  describe('getSuggestedFix', () => {
    it('should return fix for MANIFEST_NOT_FOUND', () => {
      const fix = errorHandler.getSuggestedFix('MANIFEST_NOT_FOUND');
      expect(fix).toContain('manifest.yaml');
    });

    it('should return fix for DIRECTORY_NOT_FOUND', () => {
      const fix = errorHandler.getSuggestedFix('DIRECTORY_NOT_FOUND', { directory: '/test/dir' });
      expect(fix).toContain('/test/dir');
    });

    it('should return fix for DUPLICATE_ORDER', () => {
      const fix = errorHandler.getSuggestedFix('DUPLICATE_ORDER');
      expect(fix).toContain('unique');
    });

    it('should return default fix for unknown error', () => {
      const fix = errorHandler.getSuggestedFix('UNKNOWN_ERROR');
      expect(fix).toContain('error details');
    });
  });
});
