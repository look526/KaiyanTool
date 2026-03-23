# Canvas Workflow Advance Specification

## ADDED Requirements

### Requirement: AI Backend Integration

The system SHALL integrate with real AI generation services for image and video generation.

#### Scenario: User generates image from text
- **WHEN** the user connects a text node to an image node and triggers generation
- **THEN** the text content is sent to the AI image generation service
- **AND** real images are generated based on the prompt
- **AND** the result is displayed in the image node

#### Scenario: User generates video from image
- **WHEN** the user connects an image node to a video node and triggers generation
- **THEN** the image is sent to the AI video generation service
- **AND** a video is generated from the image
- **AND** the result is displayed in the video node

#### Scenario: Real-time progress streaming
- **WHEN** an AI generation is in progress
- **THEN** progress updates are streamed via SSE
- **AND** the node displays real-time progress percentage
- **AND** partial results are shown as they become available

### Requirement: Node Grouping

The system SHALL support organizing nodes into collapsible groups.

#### Scenario: User creates a group
- **WHEN** the user selects multiple nodes
- **AND** clicks "创建分组"
- **THEN** a new group is created containing those nodes
- **AND** the group has a header with name and color

#### Scenario: User collapses a group
- **WHEN** the user clicks the collapse button on a group header
- **THEN** all nodes within the group are hidden
- **AND** only the group header is visible

#### Scenario: User expands a group
- **WHEN** the user clicks the expand button on a collapsed group
- **THEN** all nodes within the group become visible
- **AND** the group displays its original layout

#### Scenario: User moves nodes in group
- **WHEN** the user drags a group
- **THEN** all nodes within the group move together

### Requirement: Alignment Assistance

The system SHALL provide alignment guides and snap-to-grid functionality.

#### Scenario: User aligns nodes
- **WHEN** the user drags a node near another node's edge
- **THEN** an alignment guide line appears
- **AND** the dragged node snaps to align with the nearby node

#### Scenario: User distributes nodes evenly
- **WHEN** the user selects multiple nodes
- **AND** clicks "等间距分布"
- **THEN** the nodes are rearranged with equal spacing

#### Scenario: User batch aligns nodes
- **WHEN** the user selects multiple nodes
- **AND** clicks an alignment button (e.g., "居左")
- **THEN** all selected nodes are aligned to the left edge

### Requirement: Template System

The system SHALL allow users to save and load workflow templates.

#### Scenario: User saves workflow as template
- **WHEN** the user clicks "另存为模板"
- **AND** enters a template name
- **THEN** the current workflow is saved to localStorage
- **AND** the template appears in the template list

#### Scenario: User loads a template
- **WHEN** the user selects a template from the list
- **AND** clicks "应用模板"
- **THEN** a new workspace is created with the template's nodes and edges

#### Scenario: User uses preset template
- **WHEN** the user clicks "使用预设模板"
- **THEN** a preset workflow (e.g., "文字转视频") is loaded
- **AND** the user can customize it

### Requirement: Performance Optimization

The system SHALL optimize rendering for large canvases with many nodes.

#### Scenario: Viewport culling
- **WHEN** the canvas has more than 50 nodes
- **THEN** only nodes within the visible viewport are rendered
- **AND** off-screen nodes are not in the DOM

#### Scenario: Thumbnail caching
- **WHEN** a node displays an image thumbnail
- **THEN** the thumbnail is cached
- **AND** subsequent renders use the cached version

#### Scenario: Debounced saving
- **WHEN** the user makes changes to the canvas
- **THEN** the save operation is debounced by 300ms
- **AND** rapid changes are batched into a single save

### Requirement: Batch Processing

The system SHALL support batch operations on multiple selected nodes.

#### Scenario: User batch generates images
- **WHEN** the user selects multiple text nodes connected to image nodes
- **AND** clicks "批量生成"
- **THEN** all connections are processed in parallel
- **AND** each image node shows its own progress

#### Scenario: User exports selected nodes
- **WHEN** the user selects multiple nodes
- **AND** clicks "导出选中"
- **THEN** only the selected nodes and their connections are exported

### Requirement: Enhanced Keyboard Shortcuts

The system SHALL support additional keyboard shortcuts for efficiency.

#### Scenario: User copies and pastes nodes
- **WHEN** the user selects a node
- **AND** presses `Ctrl+C`
- **THEN** the node is copied to clipboard
- **WHEN** the user presses `Ctrl+V`
- **THEN** a duplicate node is created at an offset position

#### Scenario: User duplicates a node
- **WHEN** the user selects a node
- **AND** presses `Ctrl+D`
- **THEN** a duplicate node is created next to the original

#### Scenario: User resets zoom
- **WHEN** the user presses `Ctrl+0`
- **THEN** the zoom level resets to 100%

#### Scenario: User fits canvas to viewport
- **WHEN** the user presses `Ctrl+1`
- **THEN** the canvas zooms and pans to show all nodes

#### Scenario: User zooms with mouse wheel centered on cursor
- **WHEN** the user scrolls the mouse wheel
- **THEN** the zoom is centered on the mouse cursor position