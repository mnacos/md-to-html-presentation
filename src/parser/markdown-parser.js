import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { ErrorHandler } from '../utils/error-handler.js';
import yaml from 'js-yaml';
import { AssetParser } from './asset-parser.js';
import { DiagramParser } from './diagram-parser.js';
import path from 'path';

export class MarkdownParser {
  constructor(options = {}) {
    this.errorHandler = new ErrorHandler();
    this.plugins = [];
    this.assetParser = options.enableAssets ? new AssetParser(options.assetOptions) : null;
    this.diagramParser = options.enableDiagrams ? new DiagramParser() : new DiagramParser();
  }

  /**
   * Extract YAML frontmatter from markdown content
   * @param {string} content - Markdown content
   * @returns {Object} Extracted frontmatter and remaining content
   */
  extractFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return {
        frontmatter: null,
        content: content
      };
    }
    
    try {
      const frontmatterContent = match[1];
      const parsedFrontmatter = yaml.load(frontmatterContent);
      const remainingContent = content.slice(match[0].length);
      
      return {
        frontmatter: parsedFrontmatter,
        content: remainingContent
      };
    } catch (error) {
      this.errorHandler.handle(
        error,
        'Failed to parse YAML frontmatter',
        'FRONTMATTER_PARSE_ERROR'
      );
    }
  }

  /**
   * Parse markdown content with frontmatter support
   * @param {string} content - Markdown content
   * @returns {Object} Parsed AST with frontmatter and content
   */
   async parse(content) {
       try {
         const { frontmatter, content: remainingContent } = this.extractFrontmatter(content);

         const processor = remark()
           .use(remarkFrontmatter)
           .use(remarkGfm)
           .use(remarkHtml, { sanitize: false });
         const result = await processor.process(remainingContent);

         const parsed = {
           frontmatter,
           content: result.value,
           ast: result
         };

         return parsed;
       } catch (error) {
         this.errorHandler.handle(error, 'Failed to parse markdown content');
       }
     }

  /**
   * Parse markdown from a file
   * @param {string} filePath - Path to markdown file
   * @returns {Object} Parsed content
   */
  async parseFile(filePath) {
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, 'utf-8');
      return this.parse(content);
    } catch (error) {
      this.errorHandler.handle(error, `Failed to read markdown file: ${filePath}`);
    }
  }

  /**
   * Extract slides from markdown content
   * Slides are separated by ---
   * @param {string} content - Markdown content
   * @returns {Array} Array of slide objects
   */
  async extractSlides(content) {
    try {
      const parsed = await this.parse(content);
      const slides = [];
      
      if (parsed.frontmatter && parsed.frontmatter.slides) {
        return parsed.frontmatter.slides;
      }

      const contentStr = String(parsed.content);
      const slideSections = contentStr.split(/^---$/gm);

      slideSections.forEach((section, index) => {
        if (section.trim()) {
          slides.push({
            id: index + 1,
            content: section.trim(),
            type: this.determineSlideType(section)
          });
        }
      });

      return slides;
    } catch (error) {
      this.errorHandler.handle(error, 'Failed to extract slides');
    }
  }

  /**
   * Determine the type of slide based on content
   * @param {string} content - Slide content
   * @returns {string} Slide type
   */
  determineSlideType(content) {
    if (content.includes('```mermaid')) {
      return 'diagram';
    } else if (content.includes('![')) {
      return 'image';
    } else if (content.startsWith('#')) {
      return 'title';
    }
    return 'content';
  }

  /**
   * Validate diagrams in content
   * @param {string} content - Markdown content
   * @returns {Object} Validation results
   */
  validateDiagrams(content) {
    return this.diagramParser.validateAllDiagrams(content);
  }

  /**
   * Extract diagrams from content
   * @param {string} content - Markdown content
   * @returns {Object} Extracted diagrams
   */
  extractDiagrams(content) {
    return this.diagramParser.extractDiagrams(content);
  }

  /**
   * Add a remark plugin
   * @param {Function} plugin - Remark plugin function
   */
  addPlugin(plugin) {
    this.plugins.push(plugin);
  }

  /**
   * Convert markdown content to HTML
   * @param {string} content - Markdown content (with or without frontmatter)
   * @param {Object} options - Options including asset embedding
   * @returns {Object} HTML output and metadata
   */
  async toHtml(content, options = {}) {
      try {
        let processedContent = content;
        let assets = null;
        let assetErrors = null;
        
        if (this.assetParser && options.embedAssets) {
          const assetResult = await this.assetParser.processContent(content);
          processedContent = assetResult.content;
          assets = assetResult.assets;
          assetErrors = assetResult.errors;
        }
        
        const { frontmatter, content: remainingContent } = this.extractFrontmatter(processedContent);

        const processor = remark()
          .use(remarkFrontmatter)
          .use(remarkGfm)
          .use(remarkHtml, { sanitize: false });
        const result = await processor.process(remainingContent);

        const html = String(result);

        return {
          frontmatter,
          html,
          content: remainingContent,
          assets,
          assetErrors
        };
      } catch (error) {
        this.errorHandler.handle(error, 'Failed to convert markdown to HTML');
      }
    }

  /**
   * Convert markdown file to HTML
   * @param {string} filePath - Path to markdown file
   * @param {Object} options - Options including asset embedding
   * @returns {Object} HTML output and metadata
   */
  async fileToHtml(filePath, options = {}) {
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (this.assetParser && options.embedAssets) {
        this.assetParser.baseDir = path.dirname(filePath);
      }
      
      return this.toHtml(content, options);
    } catch (error) {
      this.errorHandler.handle(error, `Failed to read markdown file: ${filePath}`);
    }
  }
}
