/**
 * Integration tests for end-to-end build process
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..', '..');
const testDir = path.join(projectRoot, 'tests', 'integration-fixtures');
const buildScript = path.join(projectRoot, 'build.js');

describe('Integration Tests', () => {
  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Build with valid manifest', () => {
    const buildDir = path.join(testDir, 'valid-build');
    const outputHtml = path.join(buildDir, 'output.html');

    beforeAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });
      fs.mkdirSync(path.join(buildDir, 'content', 'slide1'), { recursive: true });

      fs.writeFileSync(
        path.join(buildDir, 'content', 'slide1', 'index.md'),
        `---
title: "Test Slide"
description: "Test description"
---

# Test Slide

Content here
`
      );

      fs.writeFileSync(
        path.join(buildDir, 'manifest.yaml'),
        `slides:
  - path: content/slide1
    order: 1
    title: "Test Slide"
`
      );
    });

    afterAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    });

    it('should build successfully', () => {
      const result = execSync(`node "${buildScript}" --config manifest.yaml --output "${outputHtml}" --content-dir content`, {
        cwd: buildDir,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      expect(result).toContain('Build complete');
    });

    it('should create output HTML file', () => {
      expect(fs.existsSync(outputHtml)).toBe(true);
    });

    it('should contain valid HTML structure', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
    });

    it('should contain slide content', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('Test Slide');
    });

    it('should contain CSS styles', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('<style>');
      expect(html).toContain('scroll-snap');
    });

    it('should contain JavaScript navigation', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('<script>');
      expect(html).toContain('scrollIntoView');
    });
  });

  describe('Build with verbose flag', () => {
    const buildDir = path.join(testDir, 'verbose-build');
    const outputHtml = path.join(buildDir, 'output.html');

    beforeAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });
      fs.mkdirSync(path.join(buildDir, 'content', 'slide1'), { recursive: true });

      fs.writeFileSync(
        path.join(buildDir, 'content', 'slide1', 'index.md'),
        `---
title: "Verbose Test"
description: "Test"
---

# Verbose Test
`
      );

      fs.writeFileSync(
        path.join(buildDir, 'manifest.yaml'),
        `slides:
  - path: content/slide1
    order: 1
`
      );
    });

    afterAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    });

    it('should output verbose messages', () => {
      const result = execSync(`node "${buildScript}" --verbose --output "${outputHtml}"`, {
        cwd: buildDir,
        encoding: 'utf8'
      });
      
      expect(result).toContain('Starting build');
    });
  });

  describe('Build with missing manifest', () => {
    const buildDir = path.join(testDir, 'missing-manifest');

    beforeAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });
      fs.mkdirSync(path.join(buildDir, 'content'), { recursive: true });
    });

    afterAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    });

    it('should create default presentation', () => {
      const outputHtml = path.join(buildDir, 'output.html');
      
      const result = execSync(`node "${buildScript}" --output "${outputHtml}"`, {
        cwd: buildDir,
        encoding: 'utf8'
      });
      
      expect(result).toContain('Default presentation');
      expect(fs.existsSync(outputHtml)).toBe(true);
    });
  });

  describe('Build with invalid config', () => {
    const buildDir = path.join(testDir, 'invalid-config');

    beforeAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });
    });

    afterAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    });

    it('should exit with config error code for invalid output extension', () => {
      try {
        execSync(`node "${buildScript}" --output output.txt`, {
          cwd: buildDir,
          encoding: 'utf8',
          stdio: 'pipe'
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error.status).toBe(2);
      }
    });
  });

  describe('Build with Mermaid diagrams', () => {
    const buildDir = path.join(testDir, 'diagram-build');
    const outputHtml = path.join(buildDir, 'output.html');

    beforeAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });
      fs.mkdirSync(path.join(buildDir, 'content', 'diagram-slide'), { recursive: true });

      fs.writeFileSync(
        path.join(buildDir, 'content', 'diagram-slide', 'index.md'),
        `---
title: "Diagram Slide"
description: "With Mermaid"
---

# Diagram Slide

\`\`\`mermaid
flowchart TD
  A --> B
  B --> C
\`\`\`
`
      );

      fs.writeFileSync(
        path.join(buildDir, 'manifest.yaml'),
        `slides:
  - path: content/diagram-slide
    order: 1
`
      );
    });

    afterAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    });

    it('should build with diagrams', () => {
      execSync(`node "${buildScript}" --output "${outputHtml}"`, {
        cwd: buildDir,
        encoding: 'utf8'
      });
      
      expect(fs.existsSync(outputHtml)).toBe(true);
    });

    it('should include mermaid rendering script', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('mermaid');
      expect(html).toContain('mermaid.initialize');
    });

    it('should include diagram div with mermaid class', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('<div class="mermaid"');
    });

    it('should convert mermaid code block to div block (not pre/code)', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('<div class="mermaid">');
      expect(html).toContain('flowchart TD');
      expect(html).toContain('A --&gt; B');
      expect(html).not.toContain('<pre><code class="language-mermaid">');
    });

    it('should properly escape HTML special characters in diagram', () => {
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('A --&gt; B');
      expect(html).toContain('B --&gt; C');
      expect(html).not.toContain('A --> B');
    });
  });

  describe('Build with excluded slides', () => {
    const buildDir = path.join(testDir, 'excluded-build');
    const outputHtml = path.join(buildDir, 'output.html');

    beforeAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });
      fs.mkdirSync(path.join(buildDir, 'content', 'included'), { recursive: true });
      fs.mkdirSync(path.join(buildDir, 'content', 'excluded'), { recursive: true });

      fs.writeFileSync(
        path.join(buildDir, 'content', 'included', 'index.md'),
        `---
title: "Included"
---

# Included Slide
`
      );

      fs.writeFileSync(
        path.join(buildDir, 'content', 'excluded', 'index.md'),
        `---
title: "Excluded"
---

# Excluded Slide
`
      );

      fs.writeFileSync(
        path.join(buildDir, 'manifest.yaml'),
        `slides:
  - path: content/included
    order: 1
    included: true
  - path: content/excluded
    order: 2
    included: false
`
      );
    });

    afterAll(() => {
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    });

    it('should exclude slides with included: false', () => {
      execSync(`node "${buildScript}" --output "${outputHtml}"`, {
        cwd: buildDir,
        encoding: 'utf8'
      });
      
      const html = fs.readFileSync(outputHtml, 'utf8');
      
      expect(html).toContain('Included');
      expect(html).not.toContain('Excluded');
    });
  });
});
