## ADDED Requirements

### Requirement: Unified script parse response schema

The script parsing APIs SHALL return a versioned structure including `parse_schema_version`, `scenes`, `characters`, optional `items`, and `metadata`, such that regex-based and AI-based parsing produce the same JSON shape for consumers.

#### Scenario: Regex parse returns the same shape as AI parse

- **WHEN** the client calls the fast regex parse endpoint with valid script text
- **THEN** the response body includes `parse_schema_version` and scene objects with fields required for mapping to `Scene` (e.g. location, time, description or summary, ordering)

#### Scenario: AI parse returns the same shape as regex parse

- **WHEN** the client calls the AI parse endpoint with valid script text and a configured provider
- **THEN** the response body matches the same schema as the regex endpoint for `scenes` and `characters` at the structural level

### Requirement: Parsing prompts live under prompts directory

All non-trivial parsing instructions for AI SHALL be loaded from `apps/api/src/prompts/` (templates or services), using `{{variable}}` placeholders; controllers and services SHALL NOT embed large parsing prompts as inline string literals.

#### Scenario: Script kind selects template

- **WHEN** the client sends `script_kind` (or equivalent) with a parse request
- **THEN** the server selects the corresponding prompt template for that kind without duplicating prompt text in the service file

### Requirement: Single AI parsing execution path

New-script AI parsing SHALL use the large-text pipeline with `providerManager` (or equivalent approved provider layer) and user-selected `model`; legacy whole-document parsing via deprecated provider services SHALL NOT be used for the primary user-facing parse flow.

#### Scenario: No duplicate provider stack for parse-ai

- **WHEN** a user invokes AI script parsing
- **THEN** the request is fulfilled through one documented code path that resolves provider and model from database configuration

### Requirement: Robust model output handling

AI segment outputs SHALL be extracted as JSON, repaired if malformed (e.g. via jsonrepair), and validated against the expected schema; partial failures SHALL be recorded in response metadata (e.g. warnings) according to the design document.

#### Scenario: Malformed segment is reported

- **WHEN** a segment returns invalid JSON after repair and retry policy applies
- **THEN** the API response includes a machine-readable warning listing the affected segment index without crashing the whole request (unless design chooses fail-fast; then document in scenario)

### Requirement: Apply parse result to episode

The system SHALL provide an authenticated API to apply a parsed script result to an episode by creating or updating `Scene` records (and optionally `Shot` drafts) according to a declared mode such as append-only or fill-empty-only.

#### Scenario: Append scenes to episode

- **WHEN** an authorized user submits a valid parse result with mode `append_scenes`
- **THEN** new scenes are created for that episode with monotonic `scene_order` and do not delete existing scenes

#### Scenario: Unauthorized user cannot apply parse

- **WHEN** a user without access to the episode's project calls apply-parse
- **THEN** the server responds with 403 or 404 and no database changes occur
