# Feature Specification: HTML Presentation Build Pipeline

**Feature Branch**: `001-html-presentation-pipeline`  
**Created**: 2025-05-18  
**Status**: Draft  
**Input**: Create a build pipeline for producing the single-file html from a set of markdown files. Every slide needs to have its own directory for its markdown files and related files (e.g. images) and slide order needs to be configured in a file within the top-level repo structure. Diagrams will be super important so we will need some sort of diagramming language or representation. For this first iteration, four slides are sufficient, use the headings from the file ./key-sections.txt

## User Scenarios & Testing *(mandatory)*

### Clarifications

### Session 2025-05-18

- Q: Slide navigation interaction model → A: Vertical scroll-based navigation (page-down style)
- Q: Missing/invalid asset handling → A: Fail build immediately on any missing/invalid asset (strict mode)
- Q: Frontmatter structure (fields, required/optional) → A: Title (required), description (required), no other fields
- Q: Slide markdown entry point filename → A: index.md (standard convention)
- Q: Mermaid diagram code block syntax → A: ```mermaid language identifier

---

### User Story 1 - Author Slide Content in Markdown (Priority: P1)

As a content author, I want to write each slide's content in separate markdown files so that I can focus on the message without worrying about HTML formatting or presentation design.

**Why this priority**: This is the foundational capability - without the ability to author content in markdown, the entire system has no value. It enables all other functionality.

**Independent Test**: Can create a markdown file with frontmatter and content, run the build, and see the content rendered in the output HTML without any additional setup.

**Acceptance Scenarios**:

1. **Given** a markdown file with frontmatter (title, description), **When** I run the build command, **Then** the content appears in the generated HTML at the position defined in manifest.yaml
2. **Given** multiple markdown files with different order values, **When** I run the build, **Then** slides appear in ascending order regardless of filesystem order
3. **Given** a markdown file with headings, bullet points, and code blocks, **When** I run the build, **Then** all formatting is preserved in the output

---

### User Story 2 - Organize Slides with Associated Assets (Priority: P1)

As a content author, I want each slide to have its own directory containing the markdown and related assets (images, diagrams) so that I can keep slide-specific resources organized and referenced easily.

**Why this priority**: Slide organization is critical for maintainability as the presentation grows. Without this, managing images and diagrams becomes chaotic.

**Independent Test**: Create a slide directory with markdown referencing a local image, run build, verify image is embedded in output HTML.

**Acceptance Scenarios**:

1. **Given** a slide directory with `slide.md` and `image.png`, **When** the markdown references `./image.png`, **Then** the image is embedded in the final HTML
2. **Given** a slide with diagram source files (e.g., Mermaid, Graphviz), **When** the build runs, **Then** diagrams are rendered as SVG/PNG in the output
3. **Given** nested asset subdirectories, **When** referenced correctly, **Then** all assets are included without path conflicts

---

### User Story 3 - Configure Slide Order and Inclusion via Manifest (Priority: P1)

As a presenter, I want to control slide order and inclusion through a manifest file so that I can reorder or exclude slides without renaming content directories or modifying code.

**Why this priority**: Declarative ordering enables easy reorganization and A/B testing of presentation flows. This is a core requirement from the constitution.

**Independent Test**: Create `manifest.yaml` with explicit slide order, reorder entries, rebuild, and verify the HTML reflects the new sequence without touching content directories.

**Acceptance Scenarios**:

1. **Given** `manifest.yaml` listing content directories with order numbers, **When** slides are reordered in the manifest, **Then** the HTML output reflects the new order
2. **Given** a content directory not listed in `manifest.yaml`, **When** the build runs, **Then** it is excluded from the output
3. **Given** duplicate order numbers in `manifest.yaml`, **When** the build runs, **Then** either an error is raised or a deterministic tiebreaker is applied
4. **Given** `manifest.yaml` with only 2 of 4 content directories listed, **When** the build runs, **Then** only those 2 slides appear in the output

---

### User Story 4 - Generate Self-Contained HTML Output (Priority: P1)

As a presenter, I want the build to produce a single HTML file with all CSS, JavaScript, and assets embedded so that I can share the presentation without requiring internet access or dependency installation.

**Why this priority**: The single-file output is a constitutional requirement (Principle I). This is the primary deliverable that makes the presentation portable and accessible.

**Independent Test**: Run the build, open the resulting HTML file offline in a browser, verify all styling, interactivity, images, and diagrams render correctly without network requests.

**Acceptance Scenarios**:

1. **Given** a complete slide deck with images and diagrams, **When** the build completes, **Then** the dist/presentation.html file is under 10MB and opens without network access
2. **Given** external font references in CSS, **When** the build runs, **Then** fonts are either embedded or replaced with system fonts (no broken font loading)
3. **Given** interactive elements (navigation, slide transitions), **When** opened in a browser, **Then** all interactions work without JavaScript errors

---

### User Story 5 - Render Diagrams from Declarative Source (Priority: P2)

As a technical presenter, I want to write diagrams in a declarative language (e.g., Mermaid) so that I can version-control diagram source and regenerate visuals as the architecture evolves.

**Why this priority**: Diagrams are explicitly called out as "super important" for this presentation. Declarative diagramming enables maintenance and iteration without graphic design tools.

**Independent Test**: Create a slide with Mermaid diagram syntax, run build, verify the diagram renders correctly in the HTML output.

**Acceptance Scenarios**:

1. **Given** a Mermaid flowchart in markdown code block, **When** the build runs, **Then** the diagram appears as rendered SVG in the output
2. **Given** a complex architecture diagram with multiple nodes and connections, **When** rendered, **Then** all elements are visible and properly positioned
3. **Given** invalid diagram syntax, **When** the build runs, **Then** the build fails with a clear error message indicating the problematic slide and syntax issue

---

### Edge Cases

- What happens when a slide directory is empty (no markdown file)? → Build fails with clear error
- What if the manifest file is malformed (YAML parse error)? → Build fails with parse error location
- How are special characters in slide titles handled (HTML escaping)? → System MUST escape HTML entities in titles and content
- How are duplicate slide titles handled in navigation? → System MUST allow duplicate titles; navigation uses order position
- What if asset files exceed size limits (e.g., 5MB image)? → Build fails with file size exceeded error

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read `index.md` from each content directory under `content/` (e.g., `content/architecture/index.md`, `content/systems/index.md`)
- **FR-002**: System MUST parse YAML manifest file (`manifest.yaml`) at repository root for slide order and inclusion configuration
- **FR-003**: System MUST embed all referenced images (PNG, JPG, SVG) as base64 in the output HTML
- **FR-004**: System MUST render Mermaid diagrams from markdown code blocks with ```mermaid language identifier into inline SVG
- **FR-005**: System MUST generate a single HTML file with embedded CSS and JavaScript
- **FR-006**: System MUST preserve markdown formatting (headings, lists, code blocks, emphasis)
- **FR-007**: System MUST provide vertical scroll-based navigation between slides with smooth scroll snapping and slide position indicator
- **FR-008**: System MUST output the final HTML to `dist/presentation.html`
- **FR-009**: System MUST fail the build with clear error if slide order is ambiguous, manifest is invalid, or any referenced asset (image/diagram) is missing or cannot be processed
- **FR-010**: System MUST require frontmatter with title (required) and description (required); no other frontmatter fields supported

### Key Entities *(include if feature involves data)*

- **Slide**: A presentation unit consisting of a markdown file and optional associated assets
- **Manifest**: YAML configuration file defining slide order and metadata
- **Asset**: Image or diagram file referenced by a slide
- **Presentation**: The complete set of slides rendered as a single HTML file

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a 4-slide presentation from scratch (with required title/description frontmatter) and generate HTML in under 10 minutes
- **SC-002**: The generated HTML file opens, renders, and supports smooth scrolling in under 2 seconds on a modern laptop
- **SC-003**: All 4 slides from key-sections.txt are present in `content/` and can be ordered arbitrarily via `manifest.yaml`
- **SC-004**: Diagrams render at 1920x1080 resolution with no pixelation or clipping
- **SC-005**: The HTML file works offline with zero network requests (verified via browser dev tools)
- **SC-006**: Build process completes in under 5 seconds for a 4-slide presentation with all assets embedded
- **SC-007**: Build fails within 1 second when encountering missing/invalid assets with clear error message

## Assumptions

- Mermaid.js is chosen as the diagramming language (industry standard, browser-compatible, declarative); diagrams use ```mermaid code blocks
- Content directories use descriptive names without order prefixes (e.g., `content/architecture/`, `content/systems/`); each MUST contain an `index.md` file with required title and description frontmatter
- The manifest file is named `manifest.yaml` and resides at repository root; content directories use descriptive names without numeric prefixes
- Base64 embedding is used for all assets (simplifies single-file output, acceptable for typical presentation sizes)
- The build toolchain is Node.js-based (leverages existing Mermaid.js ecosystem)
- Output HTML uses modern HTML5/CSS3 with progressive enhancement
- Slide navigation uses vertical scroll with CSS scroll-snap for full-screen slide transitions (no complex animations for v1)
- The four slides correspond exactly to the four sections in key-sections.txt: Architecture, Systems, Some Topic, Challenges ahead; each content directory MUST contain an `index.md` with required title and description frontmatter
