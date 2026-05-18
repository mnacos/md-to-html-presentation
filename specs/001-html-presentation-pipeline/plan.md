# Implementation Plan: HTML Presentation Build Pipeline

**Branch**: `001-html-presentation-pipeline` | **Date**: 2025-05-18 | **Spec**: `specs/001-html-presentation-pipeline/spec.md`  
**Input**: Feature specification from `/specs/001-html-presentation-pipeline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a Node.js-based pipeline that transforms markdown slide content with Mermaid diagrams into a single self-contained HTML presentation file. The system uses a YAML manifest for declarative slide ordering, embeds all assets as base64, and provides scroll-based navigation with CSS scroll-snap.

## Technical Context

**Language/Version**: Node.js 18+ (LTS)  
**Primary Dependencies**: 
- `mermaid` (diagram rendering)
- `js-yaml` (manifest parsing)
- `remark` (markdown parsing with frontmatter support)
- `highlight.js` (syntax highlighting, optional)
**Storage**: File system (slides/, dist/)  
**Testing**: Jest (Node.js testing framework)  
**Target Platform**: Node.js runtime (build tool), modern browsers (presentation output)  
**Project Type**: CLI tool / build pipeline  
**Performance Goals**: Build <5s for 4 slides, render <2s in browser, output <10MB  
**Constraints**: Single HTML output, zero network requests, strict error handling for missing assets, required title/description frontmatter  
**Scale/Scope**: 4 slides initially (Architecture, Systems, Some Topic, Challenges ahead), extensible to more  
**Input Format**: `content/<name>/index.md` with YAML frontmatter, `manifest.yaml` manifest  
**Output Format**: `dist/presentation.html` (self-contained)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Single-File Output | ✅ PASS | Output is single HTML with embedded CSS/JS/assets |
| II. Markdown-First Content | ✅ PASS | Content authored in `slides/*/index.md` files |
| III. Declarative Ordering | ✅ PASS | Slide order controlled via `slides.yaml` manifest |
| IV. Independent Content Units | ✅ PASS | Each slide is self-contained `index.md` with assets |
| V. Build-Time Transformation | ✅ PASS | All processing at build time; no runtime assembly |

**Gate Status**: ✅ PASS - No violations requiring complexity justification

## Project Structure

### Documentation (this feature)

```text
specs/001-html-presentation-pipeline/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (build tool CLI contract)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
content/
├── architecture/
│   └── index.md
├── systems/
│   └── index.md
├── some-topic/
│   └── index.md
└── challenges/
    └── index.md

manifest.yaml            # Slide order manifest
build.js                 # Build pipeline script
package.json             # Node.js dependencies
dist/
└── presentation.html    # Generated output

tests/
├── unit/
│   └ # Build logic tests
└── integration/
    └ # End-to-end build tests
```

**Structure Decision**: Single project structure with `content/` directory for presentation content, root-level build script, and `dist/` for output. This aligns with constitution's Content Organization section.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No complexity violations detected. All design decisions align with constitutional principles.
