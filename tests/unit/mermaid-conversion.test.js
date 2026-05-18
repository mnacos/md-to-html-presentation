/**
 * Unit tests for Mermaid block conversion
 */

describe('Mermaid Block Conversion', () => {
  const convertMermaidBlocks = (content) => {
    const mermaidBlockRegex = /```mermaid\s*([\s\S]*?)```/g;
    
    return content.replace(mermaidBlockRegex, (match, diagramCode) => {
      const trimmedCode = diagramCode.trim();
      const escapedCode = trimmedCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      return `<div class="mermaid">\n${escapedCode}\n</div>`;
    });
  };

  describe('convertMermaidBlocks', () => {
    it('should convert simple mermaid code block to div with mermaid class', () => {
      const input = '```mermaid\nflowchart TD\n  A --> B\n```';
      const expected = '<div class="mermaid">\nflowchart TD\n  A --&gt; B\n</div>';
      
      const result = convertMermaidBlocks(input);
      
      expect(result).toBe(expected);
    });

    it('should convert mermaid block with leading/trailing whitespace in code', () => {
      const input = '```mermaid\n  graph LR\n    A --> B\n  ```';
      const expected = '<div class="mermaid">\ngraph LR\n    A --&gt; B\n</div>';
      
      const result = convertMermaidBlocks(input);
      
      expect(result).toBe(expected);
    });

    it('should escape HTML special characters in mermaid code', () => {
      const input = '```mermaid\ngraph LR\n  A["Hello & World"] --> B\n```';
      const result = convertMermaidBlocks(input);
      
      expect(result).toContain('<div class="mermaid">');
      expect(result).toContain('Hello &amp; World');
      expect(result).not.toContain('Hello & World');
    });

    it('should escape less-than and greater-than signs', () => {
      const input = '```mermaid\ngraph LR\n  A --> B < C\n```';
      const result = convertMermaidBlocks(input);
      
      expect(result).toContain('B &lt; C');
    });

    it('should handle multiple mermaid blocks in content', () => {
      const input = `
Some text

\`\`\`mermaid
graph TD
  A --> B
\`\`\`

More text

\`\`\`mermaid
flowchart LR
  X --> Y
\`\`\`
`;
      const result = convertMermaidBlocks(input);
      
      const mermaidDivs = (result.match(/<div class="mermaid">/g) || []).length;
      expect(mermaidDivs).toBe(2);
      expect(result).toContain('graph TD');
      expect(result).toContain('flowchart LR');
    });

    it('should preserve content outside mermaid blocks', () => {
      const input = `# Title

This is some text.

\`\`\`mermaid
graph TD
  A --> B
\`\`\`

More text after.
`;
      const result = convertMermaidBlocks(input);
      
      expect(result).toContain('# Title');
      expect(result).toContain('This is some text.');
      expect(result).toContain('More text after.');
      expect(result).toContain('<div class="mermaid">');
    });

    it('should handle mermaid block with no code', () => {
      const input = '```mermaid\n```';
      const expected = '<div class="mermaid">\n\n</div>';
      
      const result = convertMermaidBlocks(input);
      
      expect(result).toBe(expected);
    });

    it('should handle mermaid block with complex syntax', () => {
      const input = '```mermaid\nsequenceDiagram\n  Alice->>John: Hello John, how are you?\n  John-->>Alice: Great!\n  Alice-)John: See you later!\n```';
      const result = convertMermaidBlocks(input);
      
      expect(result).toContain('<div class="mermaid">');
      expect(result).toContain('sequenceDiagram');
      expect(result).toContain('Alice-&gt;&gt;John');
      expect(result).toContain('</div>');
    });

    it('should handle mermaid with quotes in node labels', () => {
      const input = '```mermaid\ngraph TD\n  A["Hello"] --> B\n```';
      const result = convertMermaidBlocks(input);
      
      expect(result).toContain('<div class="mermaid">');
      expect(result).toContain('&quot;Hello&quot;');
    });
  });
});
