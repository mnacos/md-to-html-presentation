# Build Tool CLI Contract

**Version**: 1.0.0  
**Purpose**: Define the command-line interface for the presentation builder

---

## Command: `build`

Generate a self-contained HTML presentation from markdown slides.

### Usage

```bash
node build.js [options]
```

### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--config` | string | `manifest.yaml` | Path to manifest file |
| `--output` | string | `dist/presentation.html` | Output file path |
| `--content-dir` | string | `content` | Directory containing content subdirectories |
| `--verbose` | boolean | `false` | Show detailed build logs |
| `--help` | boolean | `false` | Display help information |

### Examples

```bash
# Basic build with defaults
node build.js

# Custom output location
node build.js --output my-presentation.html

# Verbose logging
node build.js --verbose

# Custom manifest path
node build.js --config path/to/manifest.yaml
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Build failure (missing files, invalid syntax, etc.) |
| 2 | Configuration error (invalid arguments, missing manifest) |

### Error Output

Errors are written to stderr with the following format:

```
Error: [ERROR_CODE] in [CONTEXT]
  [Description]
  [Suggested fix]
```

**Example**:
```
Error: MISSING_INDEX_FILE in content/architecture
  Directory 'content/architecture' does not contain index.md
  Create content/architecture/index.md with required frontmatter
```

---

## Input Contract

### Manifest File (manifest.yaml)

**Location**: Repository root (default) or specified via `--config`

**Schema**:
```yaml
slides:
  - path: string (required, unique directory name)
    order: number (required, unique positive integer)
```

**Constraints**:
- File MUST be valid YAML
- `slides` array MUST contain at least 1 entry
- All `path` values MUST reference existing directories
- All `order` values MUST be unique
- Each directory MUST contain `index.md`

### Content Files

**Location**: `content/<path>/index.md`

**Schema**:
```markdown
---
title: string (required, 1-200 characters)
description: string (required, 1-500 characters)
---

[Markdown content with optional Mermaid diagrams and image references]
```

**Constraints**:
- MUST use YAML frontmatter with `---` delimiters
- `title` and `description` MUST be present and non-empty
- Image paths MUST be relative to slide directory
- Mermaid diagrams MUST use ```mermaid code blocks

### Asset Files

**Location**: `content/<path>/<filename>` (anywhere in content directory)

**Supported Formats**:
- PNG (`image/png`)
- JPEG/JPG (`image/jpeg`)
- SVG (`image/svg+xml`)

**Constraints**:
- File size MUST be <5MB
- Path references MUST be relative to content directory

---

## Output Contract

### Generated HTML File

**Location**: Specified via `--output` or `dist/presentation.html`

**Structure**:
- Single self-contained HTML5 file
- All CSS embedded in `<style>` tag in `<head>`
- All JavaScript embedded in `<script>` tag before `</body>`
- All images embedded as base64 data URLs
- All Mermaid diagrams rendered as inline SVG
- Zero external network requests

**Features**:
- Vertical scroll navigation with CSS scroll-snap
- Slide position indicator
- Responsive design (1920x1080 target)
- Accessibility: ARIA landmarks, semantic HTML
- UTF-8 encoding

**Performance Targets**:
- Load time: <2 seconds on modern laptop
- File size: <10MB for typical presentations
- Build time: <5 seconds for 4 slides

---

## Version Compatibility

| Build Tool Version | Node.js Version | Mermaid Version |
|-------------------|-----------------|-----------------|
| 1.0.x | 18+ | 10.x |

Breaking changes will follow semantic versioning.
