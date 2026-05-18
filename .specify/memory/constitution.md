<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial)

Modified principles: N/A (initial creation)

Added sections:
  - Core Principles (5 principles)
  - Content Organization
  - Development Standards
  - Governance

Removed sections: N/A (initial creation)

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check section)
  - .specify/templates/spec-template.md ✅ aligned (requirements structure)
  - .specify/templates/tasks-template.md ✅ aligned (task organization)

Follow-up TODOs: None
-->

# Transaction Screening Presentation Constitution

## Core Principles

### I. Single-File Output
All presentations MUST be delivered as a single self-contained HTML file.
No external dependencies; all CSS, JavaScript, and assets embedded inline.
No network requests required for rendering or interaction.

**Rationale**: Ensures portability, offline accessibility, and consistent rendering across environments without dependency management overhead.

### II. Markdown-First Content
All presentation content MUST be authored in separate markdown files.
HTML generation is a build-step transformation; source remains markdown.
Each markdown file represents a logical content unit (slide, section, or topic).

**Rationale**: Separates content from presentation logic, enables version control of content, and allows non-technical contributors to edit content.

### III. Declarative Ordering
Presentation sequence MUST be controlled through declarative configuration.
Order defined in a manifest file (YAML/JSON) or frontmatter metadata.
No hardcoding of sequence in templates or generation logic.

**Rationale**: Enables easy reordering without code changes, supports multiple presentation flows from same content, and makes structure explicit and reviewable.

### IV. Independent Content Units
Each markdown file MUST be independently meaningful and testable.
Files should represent self-contained topics or slides.
No implicit dependencies between content files; all shared state in manifest.

**Rationale**: Enables modular content creation, independent review cycles, and flexible composition into different presentation variants.

### V. Build-Time Transformation
HTML generation MUST be a deterministic, reproducible build process.
Source markdown + manifest → single HTML output.
No runtime content assembly; all processing complete at build time.

**Rationale**: Guarantees output consistency, enables caching and incremental builds, and ensures the delivered HTML is truly self-contained.

## Content Organization

All presentation source files MUST reside in a `content/` directory at repository root.
A `manifest.yaml` or `manifest.json` file MUST define presentation order and metadata.
Generated HTML output MUST be placed in `dist/` directory.

Shared assets (images, diagrams) MUST be in `assets/` directory and embedded during build.
Templates for HTML generation MUST be in `.specify/presentation/` directory.

## Development Standards

All markdown files MUST use UTF-8 encoding and Unix line endings.
Frontmatter MUST include title (required) and description (required) for all presentation content.
Custom CSS/JavaScript MUST be placed in `.specify/presentation/` and injected at build time.

Code blocks in markdown MUST specify language for syntax highlighting.
All images MUST have alt text for accessibility.
Links between markdown files MUST use relative paths.

## Governance

This constitution supersedes all other presentation development practices.
Amendments require: proposal documentation, impact analysis, and team approval.
All PRs MUST verify constitution compliance in review checklist.

Complexity additions MUST be justified against the Single-File Output principle.
Breaking changes to the build process MUST include migration guidance.

**Version**: 1.0.0 | **Ratified**: 2025-05-18 | **Last Amended**: 2025-05-18
