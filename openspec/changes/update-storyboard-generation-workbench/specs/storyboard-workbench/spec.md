## ADDED Requirements

### Requirement: Storyboard workbench overview column

The storyboard episode workbench SHALL provide a left column showing an excerpt of the episode script (when linked) and a list of scenes for the episode. Selecting a scene SHALL filter the shot list to shots in that scene, with a control to show all shots again.

#### Scenario: Filter shots by scene

- **WHEN** the user selects a scene in the overview column
- **THEN** the shot list shows only shots whose `scene_id` matches that scene

#### Scenario: Show all shots

- **WHEN** the user chooses to clear scene filter
- **THEN** the shot list shows all shots for the episode

### Requirement: Lens and audio prompt controls

The workbench SHALL provide a single module for lens description and dialogue, with independent toggles controlling whether lens description, dialogue, camera movement, and visual style are merged into the video generation prompt. The API SHALL accept explicit `include_*` flags and remain backward compatible with `sync_audio_video`.

#### Scenario: Dialogue requires text when enabled

- **WHEN** dialogue inclusion is enabled for video generation
- **AND** dialogue text is empty
- **THEN** the server rejects the request with a clear validation error

### Requirement: Video generation mode

The user SHALL select a video generation mode `end_frame` or `nine_grid` before mode-specific options are shown. `end_frame` mode retains start/end frame workflows; `nine_grid` mode shows nine-grid tooling and uses the design-document reference image strategy for video.

#### Scenario: Conditional UI

- **WHEN** mode is `end_frame`
- **THEN** nine-grid-specific configuration panels are not shown as required for that mode

### Requirement: Nine-grid independent cells

The system SHALL support nine panel records with independent prompts and image generation per cell, plus one-click composite grid generation. Batch panel generation SHALL invoke real image generation, not placeholder URLs.

#### Scenario: Per-panel generation

- **WHEN** the user requests generation for a single nine-grid panel with a valid provider
- **THEN** that panel receives an `image_url` from the image generation service

### Requirement: Structured generation prompt JSON

Image and video generation flows SHALL be able to build prompts from a versioned JSON structure including lens, character, action, scene, dialogue, style, and extensible `extra` fields.

#### Scenario: Serialize to plain prompt

- **WHEN** a GenerationPrompt object is serialized for provider calls
- **THEN** the result is a non-empty plain-text prompt string suitable for model input
