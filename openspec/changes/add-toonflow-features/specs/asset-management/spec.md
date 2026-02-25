# Asset Management Spec Delta

## ADDED Requirements

### Requirement: Asset Upload

The system MUST support uploading image and video assets to the project asset library.

#### Scenario: Upload image asset

**Given** User is on asset management page
**When** User selects image file and clicks upload
**Then** System displays upload progress
**And** After upload completes, displays the image in asset library

#### Scenario: Upload video asset

**Given** User is on asset management page
**When** User selects video file and clicks upload
**Then** System transcodes the video
**And** After processing completes, displays video thumbnail in asset library

### Requirement: Asset Browsing

The system MUST support browsing, searching, and filtering assets.

#### Scenario: Browse project assets

**Given** User opens project asset library
**When** Page loads
**Then** Displays thumbnail grid of all project assets

#### Scenario: Search assets

**Given** User is on asset library page
**When** User enters search keyword
**Then** Displays assets with name or tag containing keyword

#### Scenario: Filter asset type

**Given** User is on asset library page
**When** User selects filter (image/video/all)
**Then** Displays assets of corresponding type

### Requirement: Asset Operations

The system MUST support deleting assets and copying asset links.

#### Scenario: Delete asset

**Given** User selects an asset
**When** User clicks delete button
**Then** System shows confirmation dialog
**And** After confirmation, deletes asset file and related records

#### Scenario: Copy asset link

**Given** User selects an asset
**When** User clicks copy link
**Then** Asset CDN link is copied to clipboard
