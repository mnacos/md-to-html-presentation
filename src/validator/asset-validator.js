import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ErrorHandler } from '../utils/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AssetValidator - Validates image assets for the presentation
 * 
 * Validates:
 * - File format (PNG, JPG, JPEG, SVG)
 * - File size (max 5MB)
 */
export class AssetValidator {
  constructor() {
    this.errorHandler = new ErrorHandler();
    this.supportedFormats = ['png', 'jpg', 'jpeg', 'svg'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  /**
   * Validate file format
   * @param {string} filePath - Path to file
   * @returns {Object} Validation result
   */
  validateFormat(filePath) {
    const extension = path.extname(filePath).toLowerCase().replace('.', '');
    
    if (!this.supportedFormats.includes(extension)) {
      return {
        isValid: false,
        error: `Unsupported format: ${extension}. Supported formats: ${this.supportedFormats.join(', ')}`
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate file size
   * @param {string} filePath - Path to file
   * @returns {Object} Validation result
   */
  async validateFileSize(filePath) {
    try {
      const stats = await fs.promises.stat(filePath);
      
      if (stats.size > this.maxFileSize) {
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        return {
          isValid: false,
          error: `File size (${sizeMB}MB) exceeds limit (5MB)`
        };
      }
      
      return { isValid: true, size: stats.size };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to get file size: ${error.message}`
      };
    }
  }

  /**
   * Validate asset (format and size)
   * @param {string} filePath - Path to file
   * @returns {Object} Validation result
   */
  async validate(filePath) {
    try {
      const formatResult = this.validateFormat(filePath);
      
      if (!formatResult.isValid) {
        return formatResult;
      }
      
      const sizeResult = await this.validateFileSize(filePath);
      
      if (!sizeResult.isValid) {
        return sizeResult;
      }
      
      return {
        isValid: true,
        format: path.extname(filePath).toLowerCase().replace('.', ''),
        size: sizeResult.size
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Validation failed: ${error.message}`
      };
    }
  }

  /**
   * Validate asset or throw error
   * @param {string} filePath - Path to file
   * @throws {Error} If validation fails
   */
  async validateOrThrow(filePath) {
    const result = await this.validate(filePath);
    
    if (!result.isValid) {
      throw new Error(result.error);
    }
    
    return result;
  }
}
