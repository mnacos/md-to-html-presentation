/**
 * Unit tests for ExitCodes
 */

import { ExitCodes, getExitCode } from '../../src/utils/exit-codes.js';

describe('ExitCodes', () => {
  it('should define SUCCESS as 0', () => {
    expect(ExitCodes.SUCCESS).toBe(0);
  });

  it('should define BUILD_FAILURE as 1', () => {
    expect(ExitCodes.BUILD_FAILURE).toBe(1);
  });

  it('should define CONFIG_ERROR as 2', () => {
    expect(ExitCodes.CONFIG_ERROR).toBe(2);
  });
});

describe('getExitCode', () => {
  it('should return CONFIG_ERROR for MANIFEST_NOT_FOUND', () => {
    expect(getExitCode('MANIFEST_NOT_FOUND')).toBe(2);
  });

  it('should return CONFIG_ERROR for INVALID_MANIFEST_STRUCTURE', () => {
    expect(getExitCode('INVALID_MANIFEST_STRUCTURE')).toBe(2);
  });

  it('should return CONFIG_ERROR for DIRECTORY_NOT_FOUND', () => {
    expect(getExitCode('DIRECTORY_NOT_FOUND')).toBe(2);
  });

  it('should return CONFIG_ERROR for DUPLICATE_ORDER', () => {
    expect(getExitCode('DUPLICATE_ORDER')).toBe(2);
  });

  it('should return CONFIG_ERROR for FILE_NOT_FOUND', () => {
    expect(getExitCode('FILE_NOT_FOUND')).toBe(2);
  });

  it('should return CONFIG_ERROR for FRONTMATTER_PARSE_ERROR', () => {
    expect(getExitCode('FRONTMATTER_PARSE_ERROR')).toBe(2);
  });

  it('should return BUILD_FAILURE for UNKNOWN_ERROR', () => {
    expect(getExitCode('UNKNOWN_ERROR')).toBe(1);
  });

  it('should return BUILD_FAILURE for BUILD_ERROR', () => {
    expect(getExitCode('BUILD_ERROR')).toBe(1);
  });

  it('should return BUILD_FAILURE for DIAGRAM_SYNTAX_ERROR', () => {
    expect(getExitCode('DIAGRAM_SYNTAX_ERROR')).toBe(1);
  });

  it('should return BUILD_FAILURE for ASSET_NOT_FOUND', () => {
    expect(getExitCode('ASSET_NOT_FOUND')).toBe(1);
  });
});
