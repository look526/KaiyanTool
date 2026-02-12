# Spec Delta: Asset Management

## ADDED Requirements

### Requirement: Character Creation

The system MUST allow users to create characters with basic information and reference images.

#### Scenario: Create basic character

**Given** User is logged in
**And** User has project edit permission
**When** User enters character name, age, gender, appearance description
**And** Clicks save button
**Then** System creates new character
**And** Associates character to project

#### Scenario: Create character with reference image

**Given** User is logged in
**And** User has project edit permission
**When** User uploads reference image
**And** Enters character information
**And** Clicks save button
**Then** System creates new character
**And** Uploads image to OSS
**And** Saves image URL

### Requirement: Character Management

The system MUST allow users to query, edit, and delete characters.

#### Scenario: Query character list

**Given** User is logged in
**And** User has project access permission
**When** User accesses character management page
**Then** System displays all characters in project
**And** Displays character name and thumbnail

#### Scenario: Edit character information

**Given** User is logged in
**And** User has project edit permission
**When** User modifies character information
**And** Clicks save button
**Then** System updates character information
**And** Saves update time

### Requirement: Wardrobe Management

The system MUST support creating and managing wardrobe variations for characters.

#### Scenario: Create wardrobe variation

**Given** User is logged in
**And** Character is created
**When** User adds wardrobe variation
**And** Enters wardrobe name and description
**And** Uploads reference image (optional)
**Then** System creates wardrobe variation
**And** Associates wardrobe to character

### Requirement: Character Consistency

The system MUST maintain character consistency during image generation.

#### Scenario: Generate image using reference image

**Given** User is logged in
**And** Character has reference image
**When** User uses character to generate image
**Then** System passes reference image to AI
**And** AI generated image maintains character appearance consistency

### Requirement: Scene Creation

The system MUST allow users to create scenes with basic information and reference images.

#### Scenario: Create basic scene

**Given** User is logged in
**And** User has project edit permission
**When** User enters location, time, atmosphere description
**And** Clicks save button
**Then** System creates new scene
**And** Associates scene to project

### Requirement: Scene Management

The system MUST allow users to query, edit, and delete scenes.

#### Scenario: Query scene list

**Given** User is logged in
**And** User has project access permission
**When** User accesses scene management page
**Then** System displays all scenes in project
**And** Displays location, time, and thumbnail

### Requirement: Asset Library

The system MUST provide asset library functionality supporting asset reuse and categorized management.

#### Scenario: View asset library

**Given** User is logged in
**When** User accesses asset library page
**Then** System displays all assets from user's projects
**And** Categorizes by type (characters, scenes, props, etc.)
**And** Displays thumbnails and names

#### Scenario: Reuse asset to new project

**Given** User is logged in
**And** Asset library contains character
**When** User selects character
**And** Selects target project
**And** Clicks copy button
**Then** System copies character to new project
**And** Maintains character information
**And** Copies reference image

### Requirement: Asset Upload

The system MUST support batch upload and optimization of image assets.

#### Scenario: Upload single image

**Given** User is logged in
**And** User is creating character
**When** User selects single image file
**Then** System uploads image to OSS
**And** Generates thumbnail
**And** Saves URL

#### Scenario: Batch upload images

**Given** User is logged in
**And** User is creating character
**When** User selects multiple image files
**Then** System batch uploads images to OSS
**And** Generates thumbnail for each image
**And** Saves all URLs

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## Cross-References

- Related to **Project Management** capability: Assets belong to project
- Related to **Content Management** capability: Assets extracted from content
- Related to **Shot Management** capability: Shots use characters and scenes
- Related to **Image Generation** capability: Assets used as reference images
