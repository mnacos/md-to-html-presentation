# Research: HTML Presentation Build Pipeline

**Date**: 2025-05-18  
**Purpose**: Resolve technical decisions for the build pipeline

---

## Decision: Build Toolchain

**Decision**: Node.js-based build pipeline using ES modules

**Rationale**: 
- Mermaid.js is a JavaScript library with excellent browser and Node.js support
- Node.js ecosystem provides mature markdown parsing libraries
- Single language (JavaScript/TypeScript) for both build and output
- Easy to embed Mermaid.js runtime in the generated HTML

**Alternatives considered**:
- Python with Mermaid CLI: Requires external binary dependencies
- Ruby with Haml/Slim: Smaller ecosystem for Mermaid integration
- Go: No mature Mermaid rendering library

---

## Decision: Markdown Parser

**Decision**: `remark` (unified ecosystem)

**Rationale**:
- Plugin ecosystem for frontmatter parsing (`remark-frontmatter`)
- Built-in support for code block processing (for Mermaid detection)
- Can generate HTML with `remark-html` or custom visitor
- Active maintenance, TypeScript support

**Alternatives considered**:
- `marked`: Faster but less extensible for custom processing
- `markdown-it`: Good plugin system but larger bundle size
- `showdown`: Less active maintenance

---

## Decision: YAML Parser

**Decision**: `js-yaml`

**Rationale**:
- Mature, well-maintained
- Supports YAML 1.1 and 1.2
- Safe parsing by default (no arbitrary code execution)
- Small footprint

**Alternatives considered**:
- `yaml` (eemeli/yaml): Also good, but js-yaml has broader adoption
- `yaml-js`: Less active maintenance

---

## Decision: Mermaid Rendering Strategy

**Decision**: Embed Mermaid.js runtime in output HTML; render diagrams at build time

**Rationale**:
- Build-time rendering ensures diagrams are pre-rendered as SVG
- Output HTML includes Mermaid.js for re-rendering on content updates (future-proof)
- SVG ensures crisp rendering at any resolution (1920x1080 target)
- Build failures on invalid syntax (strict mode per spec)

**Implementation**:
1. Parse markdown, detect ```mermaid blocks
2. Extract diagram definitions
3. Use Mermaid API to render to SVG during build
4. Embed SVG directly in output HTML
5. Include Mermaid.js script for future diagram updates

**Alternatives considered**:
- Client-side rendering only: Requires network or large embedded script
- Pre-render to PNG: Loses scalability, larger file size

---

## Decision: Asset Embedding

**Decision**: Base64 data URLs for all images

**Rationale**:
- Truly self-contained HTML (no external file references)
- Works offline without any dependencies
- Simple implementation
- Acceptable for presentation use cases (typical images <100KB each)

**File size analysis**:
- 4 slides with 2 images each at 50KB average = 400KB base64 overhead
- Total output ~1-2MB for typical presentations
- Well under 10MB target

**Alternatives considered**:
- External asset files: Violates single-file principle
- WebP conversion: Adds complexity, compatibility concerns

---

## Decision: CSS Architecture

**Decision**: Inline CSS with CSS Variables for theming

**Rationale**:
- Single-file output requirement
- CSS Variables enable easy theming without JavaScript
- Scroll-snap for slide navigation is well-supported (Chrome 81+, Firefox 68+, Safari 14+)
- Minimal JavaScript required (only for Mermaid rendering)

**Key CSS features**:
- `scroll-snap-type: y mandatory` for slide transitions
- `scroll-snap-align: start` for slide positioning
- `100vh` slide heights
- Smooth scrolling behavior

**Alternatives considered**:
- JavaScript-based navigation: More complex, less accessible
- External CSS file: Violates single-file principle

---

## Decision: Frontmatter Format

**Decision**: YAML frontmatter with `---` delimiters

**Rationale**:
- Standard convention in static site generators (Jekyll, Hugo, etc.)
- Familiar to markdown authors
- Supports multi-line descriptions
- `remark-frontmatter` provides robust parsing

**Format**:
```yaml
---
title: "Architecture Overview"
description: "Explaining good vs bad friction in system design"
---
```

**Alternatives considered**:
- JSON frontmatter: Less readable
- TOML frontmatter: Less common in markdown ecosystem

---

## Decision: Error Handling Strategy

**Decision**: Fail-fast with descriptive error messages

**Rationale**:
- Strict mode per spec requirement
- Clear error messages for:
  - Missing `index.md` in slide directory
  - Invalid YAML in `slides.yaml`
  - Missing referenced images
  - Invalid Mermaid syntax
  - Duplicate order numbers in manifest

**Error format**:
```
Error: [TYPE] in [SLIDE/CONTEXT]
  [Specific issue description]
  [Suggested fix]
```

---

## Decision: Output HTML Structure

**Decision**: Semantic HTML5 with ARIA landmarks for accessibility

**Rationale**:
- Modern browser support
- Accessibility compliance
- Clean, maintainable structure
- SEO-friendly (if presentations are published)

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Presentation Title]</title>
  <style>[Embedded CSS]</style>
</head>
<body>
  <main role="main">
    <article>
      <section id="slide-1" role="region" aria-label="[Title]">
        [Rendered slide content]
      </section>
      <!-- More slides -->
    </article>
  </main>
  <nav role="navigation" aria-label="Slide navigation">
    [Progress indicator]
  </nav>
  <script>[Embedded JavaScript]</script>
</body>
</html>
```

---

## Summary of Resolved Decisions

| Topic | Decision |
|-------|----------|
| Runtime | Node.js 18+ |
| Markdown Parser | `remark` ecosystem |
| YAML Parser | `js-yaml` |
| Diagram Rendering | Mermaid.js (build-time SVG) |
| Asset Embedding | Base64 data URLs |
| CSS Architecture | Inline with scroll-snap |
| Frontmatter | YAML with `---` delimiters |
| Error Handling | Fail-fast with descriptive messages |
| HTML Structure | Semantic HTML5 with ARIA |

All `NEEDS CLARIFICATION` items from the plan have been resolved. Ready for Phase 1 design.
