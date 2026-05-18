import yaml from 'js-yaml';
import { readFile, directoryExists } from '../utils/fs-utils.js';
import { ErrorHandler } from '../utils/error-handler.js';
import path from 'path';

/**
 * ManifestParser - Enhanced version for loading and validating manifest.yaml
 * 
 * Features:
 * - Load manifest from manifest.yaml at repository root
 * - Validate that all referenced directories exist
 * - Validate for duplicate order numbers
 * - Provide clear error messages for validation failures
 */
export class ManifestParser {
  constructor() {
    this.errorHandler = new ErrorHandler();
    this.manifestPath = null;
  }

  /**
   * Load and parse manifest from manifest.yaml
   * @param {string} manifestPath - Path to manifest.yaml (defaults to repository root)
   * @returns {Object} Parsed manifest object with slides array
   */
  async load(manifestPath = 'manifest.yaml') {
    try {
      this.manifestPath = path.resolve(process.cwd(), manifestPath);
      
      // Check if manifest file exists
      const fs = await import('fs');
      if (!fs.existsSync(this.manifestPath)) {
        this.errorHandler.handle(
          new Error(`Manifest file not found`),
          `Manifest file not found: ${this.manifestPath}`,
          'MANIFEST_NOT_FOUND'
        );
      }

      // Read and parse YAML
      const content = await readFile(this.manifestPath);
      const manifest = yaml.load(content);

      // Validate manifest structure
      this.validateManifestStructure(manifest);

      // Validate referenced directories exist
      await this.validateDirectories(manifest);

      // Validate for duplicate order numbers
      this.validateDuplicateOrders(manifest);

      // Normalize slides array
      manifest.slides = this.normalizeSlides(manifest.slides);

      return manifest;
    } catch (error) {
      if (error.code) {
        throw error; // Re-throw already handled errors
      }
      this.errorHandler.handle(error, 'Failed to load manifest', 'MANIFEST_LOAD_ERROR');
    }
  }

  /**
   * Validate manifest structure has required fields
   * @param {Object} manifest - Manifest object to validate
   */
  validateManifestStructure(manifest) {
    if (!manifest) {
      this.errorHandler.handle(
        new Error('Empty manifest'),
        'Manifest is empty or invalid',
        'INVALID_MANIFEST'
      );
    }

    if (!Array.isArray(manifest.slides)) {
      this.errorHandler.handle(
        new Error('Missing slides array'),
        'Manifest must contain a "slides" array',
        'INVALID_MANIFEST_STRUCTURE'
      );
    }
  }

  /**
   * Validate that all directories referenced in manifest exist
   * @param {Object} manifest - Manifest object
   */
  async validateDirectories(manifest) {
    const missingDirs = [];

    for (const slide of manifest.slides) {
      if (slide.path) {
        const dirPath = path.dirname(path.resolve(process.cwd(), slide.path));
        const exists = await directoryExists(dirPath);
        
        if (!exists) {
          missingDirs.push({
            slide: slide.title || slide.path,
            directory: dirPath
          });
        }
      }
    }

    if (missingDirs.length > 0) {
      const errorMsg = missingDirs
        .map(m => `  - Slide "${m.slide}": directory not found "${m.directory}"`)
        .join('\n');

      this.errorHandler.handle(
        new Error('Missing directories'),
        `The following directories referenced in the manifest do not exist:\n${errorMsg}`,
        'DIRECTORY_NOT_FOUND'
      );
    }
  }

  /**
   * Validate for duplicate order numbers
   * @param {Object} manifest - Manifest object
   */
  validateDuplicateOrders(manifest) {
    const orderMap = new Map();
    const duplicates = [];

    for (const slide of manifest.slides) {
      const order = slide.order;
      
      if (order !== undefined && order !== null) {
        if (orderMap.has(order)) {
          duplicates.push({
            order,
            slides: [orderMap.get(order), slide.title || slide.path]
          });
        } else {
          orderMap.set(order, slide.title || slide.path);
        }
      }
    }

    if (duplicates.length > 0) {
      const errorMsg = duplicates
        .map(d => `  - Order ${d.order}: "${d.slides[0]}" and "${d.slides[1]}"`)
        .join('\n');

      this.errorHandler.handle(
        new Error('Duplicate order numbers'),
        `Duplicate order numbers found:\n${errorMsg}`,
        'DUPLICATE_ORDER'
      );
    }
  }

  /**
   * Normalize slides array to ensure consistent structure
   * @param {Array} slides - Raw slides array
   * @returns {Array} Normalized slides array
   */
  normalizeSlides(slides) {
    return slides.map((slide, index) => ({
      ...slide,
      order: slide.order !== undefined ? slide.order : index + 1,
      included: slide.included !== undefined ? slide.included : true
    }));
  }

  /**
   * Parse manifest from markdown content (legacy support)
   * @param {string} content - Markdown content with frontmatter
   * @returns {Object} Parsed manifest object
   */
  async parse(content) {
    const { remark } = await import('remark');
    const frontmatter = (await import('remark-frontmatter')).default;
    const { visit } = await import('unist-util-visit');

    try {
      const processed = await remark()
        .use(frontmatter)
        .process(content);

      const manifest = {
        title: '',
        author: '',
        date: '',
        slides: [],
        theme: 'default'
      };

      visit(processed.result, 'yaml', (node) => {
        try {
          const parsed = yaml.load(node.value);
          Object.assign(manifest, parsed);
        } catch (e) {
          this.errorHandler.handle(e, 'Failed to parse YAML frontmatter');
        }
      });

      return manifest;
    } catch (error) {
      this.errorHandler.handle(error, 'Failed to parse manifest');
    }
  }

  /**
   * Parse manifest from a markdown file (legacy support)
   * @param {string} filePath - Path to the markdown file
   * @returns {Object} Parsed manifest object
   */
  async parseFile(filePath) {
    try {
      const content = await readFile(filePath);
      return this.parse(content);
    } catch (error) {
      this.errorHandler.handle(error, `Failed to read manifest file: ${filePath}`);
    }
  }
}
