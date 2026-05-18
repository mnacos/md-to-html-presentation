/**
 * Exit codes for the presentation build tool
 * 
 * - 0: Success
 * - 1: Build failure (runtime errors, processing errors)
 * - 2: Configuration error (invalid manifest, missing files)
 */
export const ExitCodes = {
  SUCCESS: 0,
  BUILD_FAILURE: 1,
  CONFIG_ERROR: 2
};

/**
 * Get error category based on error code
 * @param {string} errorCode - Error code
 * @returns {number} Exit code
 */
export function getExitCode(errorCode) {
  const configErrorCodes = [
    'MANIFEST_NOT_FOUND',
    'INVALID_MANIFEST_STRUCTURE',
    'INVALID_MANIFEST',
    'MANIFEST_LOAD_ERROR',
    'DIRECTORY_NOT_FOUND',
    'DUPLICATE_ORDER',
    'MISSING_PARAMETER',
    'FILE_NOT_FOUND',
    'FRONTMATTER_PARSE_ERROR',
    'FRONTMATTER_VALIDATION_ERROR',
    'CONFIG_ERROR'
  ];

  if (configErrorCodes.includes(errorCode)) {
    return ExitCodes.CONFIG_ERROR;
  }

  return ExitCodes.BUILD_FAILURE;
}

export default ExitCodes;
