# Canvas Workflow Enhancement Specification

## ADDED Requirements

### Requirement: Node Configuration Panel

The system SHALL provide a configurable panel for editing selected node properties, displayed on the right side of the canvas.

#### Scenario: User edits text node content
- **WHEN** the user selects a text node
- **THEN** a configuration panel appears on the right
- **AND** the panel shows a text editor with the current content
- **WHEN** the user modifies the text and clicks save
- **THEN** the node content is updated

#### Scenario: User configures image generation parameters
- **WHEN** the user selects an image node
- **THEN** the panel shows AI model selector, size options, and generation parameters
- **WHEN** the user clicks "生成图片"
- **THEN** the AI generation is triggered with the configured parameters

#### Scenario: User configures video generation parameters
- **WHEN** the user selects a video node
- **THEN** the panel shows AI model selector, duration, and resolution options
- **WHEN** the user clicks "生成视频"
- **THEN** the AI generation is triggered with the configured parameters

### Requirement: Keyboard Shortcuts

The system SHALL support keyboard shortcuts for efficient operation.

#### Scenario: User deletes selected nodes
- **WHEN** the user selects one or more nodes
- **AND** presses `Delete` or `Backspace`
- **THEN** all selected nodes are deleted

#### Scenario: User undoes last action
- **WHEN** the user presses `Ctrl+Z`
- **THEN** the last operation is undone
- **AND** the canvas state is restored to before that operation

#### Scenario: User redoes undone action
- **WHEN** the user presses `Ctrl+Y` or `Ctrl+Shift+Z`
- **THEN** the previously undone operation is redone

#### Scenario: User saves workspace
- **WHEN** the user presses `Ctrl+S`
- **THEN** the current workspace state is saved to the database

#### Scenario: User selects all nodes
- **WHEN** the user presses `Ctrl+A`
- **THEN** all nodes on the canvas are selected

#### Scenario: User pans canvas with Space key
- **WHEN** the user holds `Space` and drags the mouse
- **THEN** the canvas viewport pans in the drag direction

#### Scenario: User adds text node by double-clicking
- **WHEN** the user double-clicks on an empty canvas area
- **THEN** a new text node is created at the click position

### Requirement: History Management (Undo/Redo)

The system SHALL maintain an operation history stack for undo and redo functionality.

#### Scenario: User performs undo operation
- **WHEN** the user clicks the undo button or presses `Ctrl+Z`
- **AND** there is an operation to undo
- **THEN** the canvas state is restored to the previous state
- **AND** the operation is moved to the redo stack

#### Scenario: User performs redo operation
- **WHEN** the user clicks the redo button or presses `Ctrl+Y`
- **AND** there is an operation to redo
- **THEN** the canvas state is restored from the redo stack
- **AND** the operation is moved back to the undo stack

#### Scenario: History stack reaches maximum
- **WHEN** the undo stack has 50 operations (maximum)
- **AND** the user performs a new operation
- **THEN** the oldest operation is removed from the undo stack

#### Scenario: New operation clears redo stack
- **WHEN** the user performs a new operation
- **THEN** the redo stack is cleared

### Requirement: AI Generation Progress Visualization

The system SHALL display real-time progress during AI generation.

#### Scenario: Generation starts
- **WHEN** the user triggers an AI generation (text→image, image→image, etc.)
- **THEN** the target node shows a skeleton loading animation
- **AND** a progress indicator displays the current status

#### Scenario: Generation fails
- **WHEN** the AI generation fails
- **THEN** the node shows an error state with a red border
- **AND** a "重试" (retry) button appears

#### Scenario: Generation completes
- **WHEN** the AI generation completes successfully
- **THEN** the node displays the generated content
- **AND** the loading animation is removed

### Requirement: Canvas Mini-map Navigation

The system SHALL provide a mini-map for navigating large canvases.

#### Scenario: User views mini-map
- **WHEN** the user has more than 10 nodes on the canvas
- **THEN** a mini-map appears in the bottom-right corner
- **AND** it shows a scaled-down view of all nodes

#### Scenario: User navigates via mini-map
- **WHEN** the user clicks on a location in the mini-map
- **THEN** the canvas viewport scrolls to that location

#### Scenario: User sees viewport indicator
- **WHEN** the mini-map is displayed
- **THEN** a rectangle indicates the current viewport area
- **AND** the rectangle updates as the user pans the canvas

#### Scenario: User collapses mini-map
- **WHEN** the user clicks the collapse button on the mini-map
- **THEN** the mini-map is hidden
- **AND** a small button remains to expand it

### Requirement: Box Selection (Multi-select)

The system SHALL allow users to select multiple nodes by drawing a selection box.

#### Scenario: User draws selection box
- **WHEN** the user clicks and drags on an empty canvas area
- **THEN** a semi-transparent rectangle appears
- **AND** all nodes within the rectangle are selected when the drag ends

#### Scenario: User deletes selected nodes
- **WHEN** multiple nodes are selected
- **AND** the user presses `Delete`
- **THEN** all selected nodes are deleted

#### Scenario: User moves selected nodes
- **WHEN** multiple nodes are selected
- **AND** the user drags one of them
- **THEN** all selected nodes move together

### Requirement: Node Marking (Star and Labels)

The system SHALL allow users to mark nodes with stars and color labels.

#### Scenario: User stars a node
- **WHEN** the user clicks the star icon on a node
- **THEN** the node is marked as starred
- **AND** a filled star icon appears on the node

#### Scenario: User applies color label
- **WHEN** the user selects a node
- **AND** clicks a color in the config panel
- **THEN** the node displays a colored border or badge

#### Scenario: User filters nodes by label
- **WHEN** the user clicks a filter dropdown
- **THEN** only nodes with the selected label are displayed
- **WHEN** the user selects "星标" filter
- **THEN** only starred nodes are displayed

### Requirement: Export/Import Workflow

The system SHALL support exporting and importing workspace configurations.

#### Scenario: User exports workspace
- **WHEN** the user clicks the export button
- **THEN** a JSON file is downloaded containing all nodes, edges, and workspace config
- **AND** the file is named `workspace-{timestamp}.json`

#### Scenario: User imports workspace
- **WHEN** the user clicks the import button
- **AND** selects a valid workspace JSON file
- **THEN** the workspace is restored with all nodes and edges

#### Scenario: User saves as template
- **WHEN** the user clicks "另存为模板"
- **THEN** the current workspace config is saved to localStorage
- **AND** it appears in the template list

#### Scenario: User loads template
- **WHEN** the user selects a template from the list
- **THEN** a new workspace is created with the template's configuration

### Requirement: Node Version History

The system SHALL maintain version history for each node's generated content.

#### Scenario: User views node history
- **WHEN** the user clicks the history icon on a node
- **THEN** a panel expands showing all previous versions
- **AND** each version shows a thumbnail and timestamp

#### Scenario: User reverts to previous version
- **WHEN** the user clicks a previous version in the history panel
- **THEN** the node content is restored to that version
- **AND** the current version is preserved in history

### Requirement: Connection Data Flow

The system SHALL pass data between connected nodes for AI generation.

#### Scenario: Text to Image data flow
- **WHEN** a text node is connected to an image node
- **AND** the user triggers generation on the image node
- **THEN** the text content from the source node is used as the prompt

#### Scenario: Image to Image data flow
- **WHEN** an image node is connected to another image node
- **AND** the user triggers img2img generation
- **THEN** the source image URL is passed as the reference image

#### Scenario: Image to Video data flow
- **WHEN** an image node is connected to a video node
- **AND** the user triggers video generation
- **THEN** the image is used as the first frame or reference

### Requirement: AI Parameter Presets

The system SHALL provide preset configurations for AI generation.

#### Scenario: User selects quick mode
- **WHEN** the user selects "快速模式" preset
- **THEN** the generation uses low quality, fast speed settings

#### Scenario: User selects standard mode
- **WHEN** the user selects "标准模式" preset
- **THEN** the generation uses balanced quality and speed

#### Scenario: User selects high-quality mode
- **WHEN** the user selects "高清模式" preset
- **THEN** the generation uses high quality, slower speed settings

## MODIFIED Requirements

### Requirement: CanvasNode Model

The CanvasNode model SHALL be extended with additional fields:

**Previous**:
- `id`, `workspace_id`, `type`, `position_x`, `position_y`, `config`, `content`, `output_url`, `created_at`, `updated_at`

**Updated**:
- `id`, `workspace_id`, `type`, `position_x`, `position_y`, `config`, `content`, `output_url`, `created_at`, `updated_at`, `history` (JSON array), `labels` (string array), `is_starred` (boolean)

**Reason**: Support for version history, node marking, and enhanced state management.

#### Scenario: Node stores version history
- **WHEN** a node generates new output
- **THEN** the previous output is saved to the history array
- **AND** the node can be reverted to any previous version