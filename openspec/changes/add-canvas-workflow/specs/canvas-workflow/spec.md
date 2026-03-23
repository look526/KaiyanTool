# Canvas Workflow Specification

## ADDED Requirements

### Requirement: Sidebar Navigation

The system SHALL provide a unified "工作台" (Workspace) menu item in the sidebar navigation that replaces the separate "AI 图像" and "AI 视频" entries.

#### Scenario: Sidebar displays workspace menu
- **WHEN** the user views the sidebar navigation
- **THEN** they see a single "工作台" menu item with an appropriate icon
- **AND** the previous "AI 图像" and "AI 视频" menu items are removed

### Requirement: Canvas Workspace

The system SHALL provide an infinite canvas workspace where users can create, arrange, and connect nodes representing media content.

#### Scenario: User accesses workspace
- **WHEN** the user clicks the "工作台" menu item
- **THEN** they are navigated to `/workspace`
- **AND** an empty canvas is displayed

### Requirement: Node Types

The system SHALL support three types of nodes on the canvas:

| Node Type | Description | Content |
|-----------|-------------|---------|
| TextNode | Text content node | Plain text or structured text |
| ImageNode | Image content node | Image files (jpg, png, gif) |
| VideoNode | Video content node | Video files (mp4) |

#### Scenario: User creates a text node
- **WHEN** the user drags a text element onto the canvas or clicks "Add Text"
- **THEN** a new TextNode appears at the drop position
- **AND** the node displays the text content

#### Scenario: User creates an image node
- **WHEN** the user uploads an image file onto the canvas
- **THEN** a new ImageNode appears with the uploaded image thumbnail
- **AND** the node displays the image preview

#### Scenario: User creates a video node
- **WHEN** the user uploads a video file onto the canvas
- **THEN** a new VideoNode appears with the video thumbnail
- **AND** the node displays a play button overlay

### Requirement: Node Connections

The system SHALL allow users to create directed connections between nodes using Bezier curve edges.

#### Scenario: User connects two nodes
- **WHEN** the user drags from a node's output handle to another node's input handle
- **THEN** a connection line (edge) is created between them
- **AND** the edge follows a smooth Bezier curve

#### Scenario: User deletes a connection
- **WHEN** the user selects an edge and presses Delete
- **THEN** the edge is removed from the canvas

### Requirement: AI Transformation Operations

Each node SHALL support transformation operations based on its type:

| Source Type | Operations |
|-------------|------------|
| Text | Text→Image (generate image from text) |
| Image | Image→Image (img2img), Image→Video (generate video from image) |
| Video | Video→Video (video to video transformation) |

#### Scenario: User transforms text to image
- **WHEN** the user right-clicks a TextNode
- **THEN** a context menu appears with "生成图片" option
- **WHEN** the user selects "生成图片"
- **THEN** an ImageNode is created connected to the TextNode
- **AND** AI image generation is triggered

#### Scenario: User transforms image to image
- **WHEN** the user right-clicks an ImageNode
- **THEN** a context menu appears with "图生图" option
- **WHEN** the user selects "图生图"
- **THEN** a new ImageNode is created connected to the source
- **AND** AI image-to-image transformation is triggered

#### Scenario: User transforms image to video
- **WHEN** the user right-clicks an ImageNode
- **THEN** a context menu appears with "生成视频" option
- **WHEN** the user selects "生成视频"
- **THEN** a VideoNode is created connected to the ImageNode
- **AND** AI video generation is triggered

#### Scenario: User transforms video to video
- **WHEN** the user right-clicks a VideoNode
- **THEN** a context menu appears with "视频生视频" option
- **WHEN** the user selects "视频生视频"
- **THEN** a new VideoNode is created connected to the source
- **AND** AI video-to-video transformation is triggered

### Requirement: Node Preview

Each node SHALL display a preview of its output content.

#### Scenario: User views node preview
- **WHEN** a node has processed content (image or video URL)
- **THEN** the node displays a thumbnail/preview of the output
- **AND** clicking the preview opens a full-size view

### Requirement: Drag and Drop Upload

The system SHALL support drag-and-drop file upload onto the canvas.

#### Scenario: User drags file to canvas
- **WHEN** the user drags an image or video file over the canvas
- **THEN** a drop zone indicator appears
- **WHEN** the user drops the file
- **THEN** an appropriate node type is created based on the file type
- **AND** the file is uploaded to storage

### Requirement: Canvas Navigation

The system SHALL support canvas pan and zoom navigation.

#### Scenario: User pans the canvas
- **WHEN** the user clicks and drags on an empty canvas area
- **THEN** the canvas viewport moves accordingly

#### Scenario: User zooms the canvas
- **WHEN** the user scrolls the mouse wheel
- **THEN** the canvas zoom level changes
- **AND** the zoom is centered on the mouse position

### Requirement: Data Persistence

The system SHALL persist canvas state to the database.

#### Scenario: Auto-save on changes
- **WHEN** the user creates, modifies, or deletes nodes or edges
- **THEN** the changes are automatically saved to the database

#### Scenario: Workspace loads on revisit
- **WHEN** the user returns to the workspace page
- **THEN** all previously created nodes and edges are restored

## MODIFIED Requirements

### Requirement: Sidebar Menu Structure

The sidebar navigation SHALL be modified to remove the following items:
- "AI 图像" (previously at `/image-generation`)
- "AI 视频" (previously at `/video-generation`)

**Reason**: These features are now unified into the canvas workspace workflow.

**Migration**: Users should access AI generation features through the new workspace canvas.

#### Scenario: User accesses removed pages directly
- **WHEN** the user tries to access `/image-generation` or `/video-generation` directly
- **THEN** they are redirected to the new workspace page `/workspace`