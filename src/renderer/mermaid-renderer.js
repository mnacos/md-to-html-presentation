import { ErrorHandler } from '../utils/error-handler.js';
import { DiagramParser } from '../parser/diagram-parser.js';

/**
 * MermaidRenderer - Handles Mermaid diagram rendering
 * 
 * Features:
 * - Prepare diagrams for client-side rendering
 * - Handle invalid syntax with clear error messages
 * - Embed Mermaid.js script for SVG rendering
 * - Support for different diagram types
 */
export class MermaidRenderer {
  constructor(options = {}) {
    this.errorHandler = new ErrorHandler();
    this.diagramParser = new DiagramParser();
    this.mermaidConfig = options.mermaidConfig || {
      startOnLoad: true,
      theme: options.theme || 'default',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
    this.diagramCache = new Map();
  }

  /**
   * Convert Mermaid code blocks to renderable format
   * @param {string} content - Markdown content with mermaid blocks
   * @returns {Object} Content with mermaid divs and diagram metadata
   */
  convertToRenderable(content) {
    const extracted = this.diagramParser.extractDiagrams(content);
    
    if (!extracted.hasDiagrams) {
      return {
        content,
        diagrams: [],
        errors: [],
        hasDiagrams: false
      };
    }

    const diagrams = [];
    const errors = [];
    let resultContent = content;
    let diagramIndex = 0;

    for (let i = 0; i < extracted.diagrams.length; i++) {
      const diagram = extracted.diagrams[i];
      const diagramId = `mermaid-${diagramIndex}`;
      
      // Validate syntax
      const validation = this.diagramParser.validateSyntax(diagram.code);
      
      if (!validation.isValid) {
        errors.push({
          index: i,
          code: diagram.code,
          error: validation.error
        });
        
        // Replace with error message
        const errorDiv = this.generateErrorDiv(validation.error, diagram.code);
        const regex = new RegExp(`\`\`\`mermaid\\s*([\\s\\S]*?)\`\`\``, 'g');
        resultContent = resultContent.replace(regex, errorDiv);
      } else {
        // Replace mermaid block with mermaid div for client-side rendering
        const renderDiv = `<div class="mermaid" id="${diagramId}">\n${diagram.code}\n</div>`;
        const regex = new RegExp(`\`\`\`mermaid\\s*([\\s\\S]*?)\`\`\``, 'g');
        resultContent = resultContent.replace(regex, renderDiv);
        
        diagrams.push({
          index: diagramIndex,
          id: diagramId,
          code: diagram.code
        });
      }
      
      diagramIndex++;
    }

    return {
      content: resultContent,
      diagrams,
      errors,
      hasDiagrams: true
    };
  }

  /**
   * Generate error div for invalid diagrams
   * @param {string} errorMessage - Error message to display
   * @param {string} code - Original diagram code
   * @returns {string} Error HTML div
   */
  generateErrorDiv(errorMessage, code) {
    const escapedMessage = this.escapeXml(errorMessage);
    const escapedCode = this.escapeXml(code.split('\n').slice(0, 3).join('\\n'));
    
    return `
<div class="mermaid-error" style="border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fdf2f2;">
  <strong style="color: #c0392b; font-size: 16px;">Diagram Syntax Error</strong>
  <p style="color: #e74c3c; margin: 10px 0;">${escapedMessage}</p>
  <pre style="font-family: monospace; font-size: 10px; color: #7f8c8d; background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${escapedCode}</pre>
</div>`;
  }

  /**
   * Escape XML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeXml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate inline Mermaid.js script for client-side rendering
   * @returns {string} Script tag with embedded Mermaid.js
   */
  generateClientScript() {
    return `
<!-- Mermaid.js for client-side rendering -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });
</script>`;
  }

  /**
   * Clear diagram cache
   */
  clearCache() {
    this.diagramCache.clear();
  }

  /**
   * Validate diagrams without rendering
   * @param {string} content - Markdown content
   * @returns {Object} Validation results
   */
  validate(content) {
    return this.diagramParser.validateAllDiagrams(content);
  }
}

export default MermaidRenderer;
