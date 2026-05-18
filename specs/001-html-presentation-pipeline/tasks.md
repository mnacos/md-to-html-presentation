---

description: "Task list for HTML Presentation Build Pipeline"
---

# Tasks: HTML Presentation Build Pipeline

**Input**: Design documents from `/specs/001-html-presentation-pipeline/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure with `content/`, `dist/`, and `tests/` directories
- [X] T002 Initialize Node.js 18+ project with `package.json`
- [X] T003 [P] Install production dependencies: `js-yaml`, `remark`, `remark-frontmatter`, `unist-util-visit`
- [X] T004 [P] Install dev dependencies: `jest` for testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create build script entry point `build.js` with basic structure
- [X] T006 Create parser skeleton in `src/parser/manifest-parser.js` with basic structure
- [X] T007 Implement markdown parser in `src/parser/markdown-parser.js` with frontmatter support
- [X] T008 Create error handling utilities in `src/utils/error-handler.js`
- [X] T009 Implement file system utilities in `src/utils/fs-utils.js`
- [X] T010 Create output directory structure and write HTML to `dist/presentation.html`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Author Slide Content in Markdown (Priority: P1) 🎯 MVP

**Goal**: Enable content authors to write slide content in markdown with frontmatter

**Independent Test**: Can create a markdown file with frontmatter and content, run the build, and see the content rendered in the output HTML without any additional setup.

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement frontmatter extraction in `src/parser/markdown-parser.js`
- [X] T012 [P] [US1] Create frontmatter validation in `src/validator/frontmatter-validator.js`
- [X] T013 [US1] Implement markdown content to HTML conversion using remark
- [X] T014 [US1] Create sample content directories: `content/architecture/`, `content/systems/`, `content/some-topic/`, `content/challenges/`
- [X] T015 [US1] Create sample `index.md` files with required frontmatter in each slide directory

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Organize Slides with Associated Assets (Priority: P1)

**Goal**: Enable slide directories to contain and embed images and other assets

**Independent Test**: Create a slide directory with markdown referencing a local image, run build, verify image is embedded in output HTML.

### Implementation for User Story 2

- [X] T016 [P] [US2] Implement asset discovery in `src/parser/asset-parser.js`
- [X] T017 [P] [US2] Create base64 encoding utility in `src/utils/base64-utils.js`
- [X] T018 [US2] Implement image embedding to convert local image references to base64 data URLs
- [X] T019 [US2] Add asset path resolution to handle nested asset subdirectories
- [X] T020 [US2] Update markdown parser to detect and replace image references with embedded data URLs
- [X] T021 [US2] Create asset validation to check file size limits (<5MB) and supported formats (PNG, JPG, SVG)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Configure Slide Order and Inclusion via Manifest (Priority: P1)

**Goal**: Enable declarative slide ordering and inclusion via `manifest.yaml`

**Independent Test**: Create `manifest.yaml` with explicit slide order, reorder entries, rebuild, and verify the HTML reflects the new sequence without touching content directories.

### Implementation for User Story 3

- [X] T022 [P] [US3] Implement manifest loading logic in `src/parser/manifest-parser.js`
- [X] T023 [P] [US3] Create slide order sorting logic in `src/sorter/slide-sorter.js`
- [X] T024 [US3] Implement slide inclusion filtering based on manifest entries
- [X] T025 [US3] Add duplicate order number validation with clear error messages
- [X] T026 [US3] Create sample `manifest.yaml` file with all 4 slides
- [X] T027 [US3] Implement manifest validation to check referenced directories exist

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Generate Self-Contained HTML Output (Priority: P1)

**Goal**: Generate a single HTML file with all CSS, JavaScript, and assets embedded

**Independent Test**: Run the build, open the resulting HTML file offline in a browser, verify all styling, interactivity, images, and diagrams render correctly without network requests.

### Implementation for User Story 4

- [X] T028 [P] [US4] Create HTML template generator in `src/generator/html-generator.js`
- [X] T029 [P] [US4] Implement CSS generation with scroll-snap navigation styles
- [X] T030 [US4] Integrate CSS into HTML output with embedded `<style>` tag
- [X] T031 [US4] Implement slide position indicator component
- [X] T032 [US4] Add JavaScript for smooth scrolling and navigation
- [X] T033 [US4] Ensure all assets are embedded (no external references)
- [X] T034 [US4] Implement HTML escaping for special characters in titles and content
- [X] T035 [US4] Add ARIA landmarks and semantic HTML structure for accessibility

**Checkpoint**: At this point, User Stories 1-4 should produce a complete, self-contained HTML presentation

---

## Phase 7: User Story 5 - Render Diagrams from Declarative Source (Priority: P2)

**Goal**: Render Mermaid diagrams from markdown code blocks into inline SVG

**Independent Test**: Create a slide with Mermaid diagram syntax, run build, verify the diagram renders correctly in the HTML output.

### Implementation for User Story 5

- [X] T036 [P] [US5] Implement Mermaid diagram detection in `src/parser/diagram-parser.js`
- [X] T037 [P] [US5] Create Mermaid rendering wrapper in `src/renderer/mermaid-renderer.js`
- [X] T038 [US5] Integrate Mermaid.js to render diagrams to SVG during build
- [X] T039 [US5] Implement diagram error handling with clear error messages for invalid syntax
- [X] T040 [US5] Embed rendered SVG directly into HTML output
- [X] T041 [US5] Add diagram validation to catch invalid Mermaid syntax early
- [X] T042 [US5] Create sample Mermaid diagrams in slide content for testing

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T043 [P] Add CLI argument parsing for `--config`, `--output`, `--slides-dir`, `--verbose`, `--help`
- [X] T044 [P] Implement exit codes (0=success, 1=build failure, 2=config error)
- [X] T045 [P] Create comprehensive error messages with context and suggested fixes
- [X] T046 [P] Add unit tests for parsers in `tests/unit/`
- [X] T047 [P] Add integration tests for end-to-end build in `tests/integration/`
- [X] T048 Run quickstart.md validation to ensure documentation matches implementation
- [X] T049 Add JSDoc comments to all public functions
- [X] T050 Create README.md with usage instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1-3 but should be independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1-4 but should be independently testable

### Within Each User Story

- Models before services
- Services before generators
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tasks within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1:
Task: "Create frontmatter extraction in src/parser/markdown-parser.js"
Task: "Create frontmatter validation in src/validator/frontmatter-validator.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
