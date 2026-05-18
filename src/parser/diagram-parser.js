import { ErrorHandler } from '../utils/error-handler.js';

/**
 * DiagramParser - Detects and extracts Mermaid diagram code blocks from markdown
 * 
 * Features:
 * - Detect ```mermaid code blocks in markdown
 * - Extract diagram content and metadata
 * - Validate diagram syntax before rendering
 * - Provide clear error messages for invalid syntax
 */
export class DiagramParser {
  constructor() {
    this.errorHandler = new ErrorHandler();
    this.mermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/g;
  }

  /**
   * Detect Mermaid diagram code blocks in markdown content
   * @param {string} content - Markdown content
   * @returns {Array} Array of detected diagram blocks
   */
  detectMermaidBlocks(content) {
    const diagrams = [];
    let match;
    
    while ((match = this.mermaidBlockRegex.exec(content)) !== null) {
      diagrams.push({
        code: match[1].trim(),
        index: diagrams.length,
        position: match.index
      });
    }
    
    return diagrams;
  }

  /**
   * Extract all diagrams from markdown content
   * @param {string} content - Markdown content
   * @returns {Object} Extracted diagrams and metadata
   */
  extractDiagrams(content) {
    try {
      const diagrams = this.detectMermaidBlocks(content);
      
      return {
        diagrams,
        count: diagrams.length,
        hasDiagrams: diagrams.length > 0
      };
    } catch (error) {
      this.errorHandler.handle(error, 'Failed to extract diagrams', 'DIAGRAM_EXTRACT_ERROR');
    }
  }

  /**
   * Validate Mermaid diagram syntax
   * @param {string} code - Mermaid diagram code
   * @returns {Object} Validation result with isValid and error message
   */
  validateSyntax(code) {
    try {
      if (!code || code.trim().length === 0) {
        return {
          isValid: false,
          error: 'Diagram code is empty'
        };
      }

      // Basic syntax validation patterns
      const validationRules = [
        {
          name: 'flowchart',
          pattern: /^(flowchart|flowchart\s+\w+\s*\n|graph|graph\s+\w+\s*\n|subgraph|direction|A\[|A\(|A-->|A-.-|A==|click|linkStyle)/i,
          check: (c) => {
            const hasDirection = /direction|flowchart|graph/i.test(c);
            const hasNodes = /\w[\[\(]?[\w\s]+\]?[\)]?/.test(c) || /-->|-.-|==/.test(c);
            const hasBasicSyntax = hasDirection || hasNodes || /subgraph/i.test(c);
            return hasBasicSyntax;
          },
          error: 'Invalid flowchart syntax. Expected: flowchart TD/RL/LR/UD, graph, or subgraph'
        },
        {
          name: 'sequence',
          pattern: /^(sequenceDiagram|participant|activate|deactivate|Note|alt|else|end|->>|-->>|:)/i,
          check: (c) => {
            const hasDiagram = /sequenceDiagram/i.test(c);
            const hasParticipants = /participant|:/.test(c);
            return hasDiagram || hasParticipants;
          },
          error: 'Invalid sequence diagram syntax. Expected: sequenceDiagram, participant, or message arrows'
        },
        {
          name: 'class',
          pattern: /^(classDiagram|class|-->|<|--|:|<<|>>)/i,
          check: (c) => {
            const hasDiagram = /classDiagram/i.test(c);
            const hasClasses = /class\s+\w+/.test(c);
            return hasDiagram || hasClasses;
          },
          error: 'Invalid class diagram syntax. Expected: classDiagram, class definition, or relationships'
        },
        {
          name: 'state',
          pattern: /^(stateDiagram|state|-->|\[|]|start|end)/i,
          check: (c) => {
            const hasDiagram = /stateDiagram/i.test(c);
            const hasStates = /state\s+\w+|-->/i.test(c);
            return hasDiagram || hasStates;
          },
          error: 'Invalid state diagram syntax. Expected: stateDiagram, state definition, or transitions'
        },
        {
          name: 'entity-relationship',
          pattern: /^(erDiagram|entity|[\[\]]|{|}|[|}])/i,
          check: (c) => {
            const hasDiagram = /erDiagram/i.test(c);
            const hasEntities = /entity\s+\w+/i.test(c);
            return hasDiagram || hasEntities;
          },
          error: 'Invalid ER diagram syntax. Expected: erDiagram, entity definition, or relationships'
        },
        {
          name: 'gantt',
          pattern: /^(gantt|title|dateFormat|section|:)/i,
          check: (c) => {
            const hasGantt = /gantt/i.test(c);
            const hasTasks = /:/.test(c);
            return hasGantt || hasTasks;
          },
          error: 'Invalid gantt chart syntax. Expected: gantt, dateFormat, section, or task definitions'
        },
        {
          name: 'pie',
          pattern: /^(pie|title|showData|":\s*\d+)/i,
          check: (c) => {
            const hasPie = /pie/i.test(c);
            const hasValues = /:\s*\d+/.test(c);
            return hasPie || hasValues;
          },
          error: 'Invalid pie chart syntax. Expected: pie, title, or value assignments'
        },
        {
          name: 'journey',
          pattern: /^(journey|title|section|:)/i,
          check: (c) => {
            const hasJourney = /journey/i.test(c);
            const hasSections = /section/i.test(c);
            return hasJourney || hasSections;
          },
          error: 'Invalid journey diagram syntax. Expected: journey, title, or section definitions'
        },
        {
          name: 'gitgraph',
          pattern: /^(gitGraph|commit|branch|merge|checkout)/i,
          check: (c) => {
            const hasGitGraph = /gitGraph/i.test(c);
            const hasCommits = /commit|branch/i.test(c);
            return hasGitGraph || hasCommits;
          },
          error: 'Invalid gitgraph syntax. Expected: gitGraph, commit, or branch commands'
        }
      ];

      let matchedType = false;
      let validationErrors = [];

      // Check for common syntax errors in all diagrams
      if (code.includes('undefined') || code.includes('null')) {
        return {
          isValid: false,
          error: 'Diagram contains invalid keywords (undefined/null)'
        };
      }
      
      // Check for unclosed brackets
      const openBrackets = (code.match(/\[/g) || []).length;
      const closeBrackets = (code.match(/\]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        return {
          isValid: false,
          error: `Unclosed brackets: ${openBrackets} opening, ${closeBrackets} closing`
        };
      }

      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        return {
          isValid: false,
          error: `Unclosed parentheses: ${openParens} opening, ${closeParens} closing`
        };
      }

      for (const rule of validationRules) {
        if (rule.pattern.test(code)) {
          matchedType = true;
          if (!rule.check(code)) {
            validationErrors.push(rule.error);
          }
        }
      }

      if (!matchedType && validationErrors.length === 0) {
        return {
          isValid: true,
          error: null
        };
      }

      if (validationErrors.length > 0) {
        return {
          isValid: false,
          error: validationErrors.join('; ')
        };
      }

      return {
        isValid: true,
        error: null
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Syntax validation failed: ${error.message}`
      };
    }
  }

  /**
   * Validate all diagrams in content
   * @param {string} content - Markdown content
   * @returns {Object} Validation results for all diagrams
   */
  validateAllDiagrams(content) {
    const extracted = this.extractDiagrams(content);
    const results = extracted.diagrams.map(diagram => {
      const validation = this.validateSyntax(diagram.code);
      return {
        index: diagram.index,
        code: diagram.code,
        ...validation
      };
    });

    const invalidDiagrams = results.filter(r => !r.isValid);
    
    return {
      total: results.length,
      valid: results.length - invalidDiagrams.length,
      invalid: invalidDiagrams.length,
      results,
      invalidDiagrams
    };
  }

  /**
   * Replace Mermaid blocks with placeholder for HTML generation
   * @param {string} content - Markdown content
   * @param {Array} diagrams - Array of diagram objects with id
   * @returns {string} Content with placeholders
   */
  replaceWithPlaceholders(content, diagrams) {
    let result = content;
    
    diagrams.forEach((diagram, index) => {
      const placeholder = `<!-- MERMAID_DIAGRAM_${index} -->`;
      const regex = new RegExp(`\`\`\`mermaid\\s*([\\s\\S]*?)\`\`\``, 'g');
      result = result.replace(regex, placeholder);
    });
    
    return result;
  }

  /**
   * Get diagram by index from content
   * @param {string} content - Markdown content
   * @param {number} index - Diagram index
   * @returns {Object|null} Diagram object or null
   */
  getDiagramByIndex(content, index) {
    const diagrams = this.detectMermaidBlocks(content);
    return diagrams[index] || null;
  }
}

export default DiagramParser;
