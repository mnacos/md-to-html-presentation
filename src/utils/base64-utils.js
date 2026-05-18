import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Base64Utils - Utilities for base64 encoding and data URLs
 * 
 * Provides:
 * - File to base64 encoding
 * - Data URL generation
 * - MIME type mapping
 */
export class Base64Utils {
  constructor() {
    this.mimeTypeMap = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'svg': 'image/svg+xml'
    };
  }

  /**
   * Get MIME type for file extension
   * @param {string} filePath - Path to file
   * @returns {string} MIME type
   */
  getMimeType(filePath) {
    const extension = path.extname(filePath).toLowerCase().replace('.', '');
    return this.mimeTypeMap[extension] || 'application/octet-stream';
  }

  /**
   * Encode file to base64
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} Base64 encoded string
   */
  async encodeFile(filePath) {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);
      
      const buffer = await fs.promises.readFile(absolutePath);
      return buffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to encode file to base64: ${error.message}`);
    }
  }

  /**
   * Convert file to data URL
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} Data URL
   */
  async toDataUrl(filePath) {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);
      
      const mimeType = this.getMimeType(absolutePath);
      const base64 = await this.encodeFile(absolutePath);
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      throw new Error(`Failed to convert file to data URL: ${error.message}`);
    }
  }

  /**
   * Encode buffer to base64
   * @param {Buffer} buffer - Buffer to encode
   * @returns {string} Base64 encoded string
   */
  encodeBuffer(buffer) {
    return buffer.toString('base64');
  }

  /**
   * Decode base64 to buffer
   * @param {string} base64 - Base64 string
   * @returns {Buffer} Decoded buffer
   */
  decodeToBuffer(base64) {
    return Buffer.from(base64, 'base64');
  }
}
