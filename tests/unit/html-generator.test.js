/**
 * Unit tests for HtmlGenerator
 */

import { HtmlGenerator } from '../../src/generator/html-generator.js';

describe('HtmlGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new HtmlGenerator();
  });

  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(generator.escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('should escape less than', () => {
      expect(generator.escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape greater than', () => {
      expect(generator.escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape double quotes', () => {
      expect(generator.escapeHtml('He said "Hello"')).toBe('He said &quot;Hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(generator.escapeHtml("It's")).toContain('&#39;');
    });

    it('should handle non-string input', () => {
      expect(generator.escapeHtml(null)).toBe('');
      expect(generator.escapeHtml(undefined)).toBe('');
      expect(generator.escapeHtml(123)).toBe('');
    });
  });

  describe('generateCss', () => {
    it('should generate CSS with scroll-snap', () => {
      const css = generator.generateCss();
      
      expect(css).toContain('scroll-snap-type');
      expect(css).toContain('scroll-snap-align');
    });

    it('should generate responsive styles', () => {
      const css = generator.generateCss();
      
      expect(css).toContain('@media (max-width: 768px)');
    });

    it('should generate print styles', () => {
      const css = generator.generateCss();
      
      expect(css).toContain('@media print');
    });

    it('should generate reduced motion styles', () => {
      const css = generator.generateCss();
      
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('should include slide styles', () => {
      const css = generator.generateCss();
      
      expect(css).toContain('.slide');
      expect(css).toContain('.slide-content');
    });
  });

  describe('generateJavaScript', () => {
    it('should generate navigation JavaScript', () => {
      const js = generator.generateJavaScript();
      
      expect(js).toContain('scrollIntoView');
      expect(js).toContain('keydown');
    });

    it('should include keyboard navigation', () => {
      const js = generator.generateJavaScript();
      
      expect(js).toContain('ArrowDown');
      expect(js).toContain('ArrowUp');
      expect(js).toContain('PageDown');
      expect(js).toContain('PageUp');
    });

    it('should include touch support', () => {
      const js = generator.generateJavaScript();
      
      expect(js).toContain('touchstart');
      expect(js).toContain('touchend');
    });
  });

  describe('generate', () => {
    it('should generate complete HTML document', async () => {
      const html = await generator.generate({
        title: 'Test Presentation',
        slides: [{ content: '# Test', type: 'title' }]
      });
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
    });

    it('should include escaped title', async () => {
      const html = await generator.generate({
        title: 'Test <script>alert(1)</script>',
        slides: []
      });
      
      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include slide content', async () => {
      const html = await generator.generate({
        title: 'Test',
        slides: [{ content: '# Hello', type: 'content' }]
      });
      
      expect(html).toContain('# Hello');
    });

    it('should include accessibility features', async () => {
      const html = await generator.generate({
        title: 'Test',
        slides: []
      });
      
      expect(html).toContain('role="main"');
      expect(html).toContain('role="navigation"');
      expect(html).toContain('skip-link');
    });

    it('should include slide navigation', async () => {
      const html = await generator.generate({
        title: 'Test',
        slides: [{ content: 'Slide 1' }, { content: 'Slide 2' }]
      });
      
      expect(html).toContain('nav-arrow');
      expect(html).toContain('slide-indicator');
    });

    it('should use default values for missing options', async () => {
      const html = await generator.generate({ slides: [] });
      
      expect(html).toContain('Presentation');
    });
  });

  describe('processDiagrams', () => {
    it('should process slides with mermaid diagrams', async () => {
      const html = '<html><body></body></html>';
      const slides = [{
        content: '<div class="mermaid">\nflowchart TD\n  A --> B\n</div>'
      }];
      
      const result = await generator.processDiagrams(html, slides, process.cwd());
      
      expect(result.html).toContain('mermaid');
      expect(result.html).toContain('mermaid.initialize');
    });

    it('should handle slides without diagrams', async () => {
      const html = '<html><body></body></html>';
      const slides = [{ content: 'No diagrams here' }];
      
      const result = await generator.processDiagrams(html, slides, process.cwd());
      
      expect(result.html).toContain('<html>');
    });
  });

  describe('embedImages', () => {
    it('should return assets and errors', async () => {
      const html = '<img src="test.png">';
      const result = await generator.embedImages(html, process.cwd());
      
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('assets');
      expect(result).toHaveProperty('assetErrors');
    });
  });
});
