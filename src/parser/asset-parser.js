import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Base64Utils } from '../utils/base64-utils.js';
import { AssetValidator } from '../validator/asset-validator.js';
import { ErrorHandler } from '../utils/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AssetParser - Discovers and processes asset references in markdown
 * 
 * Features:
 * - Image discovery in markdown content
 * - Asset path resolution
 * - Image embedding as base64 data URLs
 * - Asset validation
 */
export class AssetParser {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.base64Utils = new Base64Utils();
    this.validator = new AssetValidator();
    this.errorHandler = new ErrorHandler();
    this.imageRegex = /!\[(?:[^\]]*)\]\(([^)]+)\)/g;
    this.warnings = [];
  }

  /**
   * Discover image references in markdown content
   * @param {string} content - Markdown content
   * @returns {Array} Array of image references
   */
  discoverImages(content) {
    const images = [];
    let match;
    
    while ((match = this.imageRegex.exec(content)) !== null) {
      images.push({
        original: match[0],
        path: match[1],
        position: match.index
      });
    }
    
    return images;
  }

  /**
   * Resolve asset path relative to base directory or markdown file
   * @param {string} imagePath - Image path from markdown
   * @param {string} markdownFile - Path to markdown file (optional)
   * @returns {string} Resolved absolute path
   */
  resolveAssetPath(imagePath, markdownFile = null) {
    if (path.isAbsolute(imagePath)) {
      return imagePath;
    }
    
    if (markdownFile) {
      const markdownDir = path.dirname(markdownFile);
      return path.resolve(markdownDir, imagePath);
    }
    
    return path.resolve(this.baseDir, imagePath);
  }

  /**
   * Validate and embed image as base64 data URL
   * @param {string} imagePath - Image path
   * @param {string} markdownFile - Path to markdown file (optional)
   * @returns {Promise<Object>} Embedded image info or error
   */
  async embedImage(imagePath, markdownFile = null) {
    try {
      const resolvedPath = this.resolveAssetPath(imagePath, markdownFile);
      
      if (!fs.existsSync(resolvedPath)) {
        return {
          success: false,
          originalPath: imagePath,
          resolvedPath: resolvedPath,
          error: `Image file not found: ${resolvedPath}`
        };
      }
      
      const validationResult = await this.validator.validate(resolvedPath);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          originalPath: imagePath,
          resolvedPath: resolvedPath,
          error: validationResult.error
        };
      }
      
      const dataUrl = await this.base64Utils.toDataUrl(resolvedPath);
      
      return {
        success: true,
        originalPath: imagePath,
        resolvedPath: resolvedPath,
        dataUrl: dataUrl,
        format: validationResult.format,
        size: validationResult.size
      };
    } catch (error) {
      return {
        success: false,
        originalPath: imagePath,
        error: error.message
      };
    }
  }

  /**
   * Process markdown content and replace image paths with data URLs
   * @param {string} content - Markdown content
   * @param {string} markdownFile - Path to markdown file (optional)
   * @returns {Promise<Object>} Processed content and asset info
   */
  async processContent(content, markdownFile = null) {
    const images = this.discoverImages(content);
    const embeddedAssets = [];
    const errors = [];
    
    for (const image of images) {
      const result = await this.embedImage(image.path, markdownFile);
      
      if (result.success) {
        embeddedAssets.push(result);
      } else {
        errors.push(result);
        this.warnings.push(result.error);
      }
    }
    
    let processedContent = content;
    
    for (const asset of embeddedAssets) {
      const escapedPath = asset.originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const imageRegex = new RegExp(`!\\[[^\\]]*\\]\\(${escapedPath}\\)`, 'g');
      processedContent = processedContent.replace(imageRegex, `![image](${asset.dataUrl})`);
    }
    
    return {
      content: processedContent,
      assets: embeddedAssets,
      errors: errors
    };
  }

  /**
   * Process markdown file and embed images
   * @param {string} filePath - Path to markdown file
   * @returns {Promise<Object>} Processed content and asset info
   */
  async processFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return this.processContent(content, filePath);
    } catch (error) {
      return {
        content: null,
        assets: [],
        errors: [{ error: `Failed to read file: ${error.message}` }]
      };
    }
  }

  /**
   * Get list of all asset paths referenced in markdown
   * @param {string} content - Markdown content
   * @returns {Array} Array of asset paths
   */
  getAssetPaths(content) {
    const images = this.discoverImages(content);
    return images.map(img => img.path);
  }

  /**
   * Clear warnings
   */
  clearWarnings() {
    this.warnings = [];
  }

  /**
   * Get all warnings
   * @returns {Array} Array of warning messages
   */
  getWarnings() {
    return [...this.warnings];
  }
}
