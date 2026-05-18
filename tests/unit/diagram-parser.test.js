/**
 * Unit tests for DiagramParser
 */

import { DiagramParser } from '../../src/parser/diagram-parser.js';

describe('DiagramParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DiagramParser();
  });

  describe('detectMermaidBlocks', () => {
    it('should detect single mermaid block', () => {
      const content = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\``;
      const diagrams = parser.detectMermaidBlocks(content);
      
      expect(diagrams).toHaveLength(1);
      expect(diagrams[0].code).toContain('flowchart TD');
    });

    it('should detect multiple mermaid blocks', () => {
      const content = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`

Some text

\`\`\`mermaid
sequenceDiagram
  A->>B: Test
\`\`\``;
      const diagrams = parser.detectMermaidBlocks(content);
      
      expect(diagrams).toHaveLength(2);
    });

    it('should return empty array for no mermaid blocks', () => {
      const content = '# No diagrams here';
      const diagrams = parser.detectMermaidBlocks(content);
      
      expect(diagrams).toHaveLength(0);
    });
  });

  describe('extractDiagrams', () => {
    it('should extract diagrams with metadata', () => {
      const content = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\``;
      const result = parser.extractDiagrams(content);
      
      expect(result.count).toBe(1);
      expect(result.hasDiagrams).toBe(true);
      expect(result.diagrams).toHaveLength(1);
    });

    it('should handle content without diagrams', () => {
      const content = '# Content';
      const result = parser.extractDiagrams(content);
      
      expect(result.count).toBe(0);
      expect(result.hasDiagrams).toBe(false);
    });
  });

  describe('validateSyntax', () => {
    it('should validate empty diagram', () => {
      const result = parser.validateSyntax('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should validate flowchart diagram', () => {
      const code = `flowchart TD
  A --> B`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate sequence diagram', () => {
      const code = `sequenceDiagram
  participant A
  A->>B: Message`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate class diagram', () => {
      const code = `classDiagram
  class Animal`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(true);
    });

    it('should detect unclosed brackets', () => {
      const code = `flowchart TD
  A[B`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('brackets');
    });

    it('should detect unclosed parentheses', () => {
      const code = `flowchart TD
  A(Test`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('parentheses');
    });

    it('should detect invalid keywords', () => {
      const code = `flowchart TD
  A[undefined]`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(false);
    });

    it('should validate pie chart', () => {
      const code = `pie
  "Apples" : 10
  "Oranges" : 5`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate gantt chart', () => {
      const code = `gantt
  dateFormat YYYY-MM-DD
  section Section
  Task :a, 2024-01-01, 30d`;
      const result = parser.validateSyntax(code);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAllDiagrams', () => {
    it('should validate all diagrams in content', () => {
      const content = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`

\`\`\`mermaid
flowchart TD
  A --> C
\`\`\``;
      const result = parser.validateAllDiagrams(content);
      
      expect(result.total).toBe(2);
      expect(result.valid).toBe(2);
    });

    it('should return empty results for no diagrams', () => {
      const content = '# No diagrams';
      const result = parser.validateAllDiagrams(content);
      
      expect(result.total).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('getDiagramByIndex', () => {
    it('should get diagram at specific index', () => {
      const content = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`

\`\`\`mermaid
sequenceDiagram
  A->>B: Test
\`\`\``;
      const diagram = parser.getDiagramByIndex(content, 1);
      
      expect(diagram).toBeDefined();
      expect(diagram.code).toContain('sequenceDiagram');
    });

    it('should return null for invalid index', () => {
      const content = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\``;
      const diagram = parser.getDiagramByIndex(content, 5);
      
      expect(diagram).toBeNull();
    });
  });
});
