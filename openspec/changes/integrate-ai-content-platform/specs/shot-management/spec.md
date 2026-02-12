# Spec Delta: Shot Management

## ADDED Requirements

### Requirement: Shot List Generation

The system MUST be able to automatically generate shot list from script.

#### Scenario: Generate shot list from script

**Given** User is logged in
**And** Script is parsed
**When** User clicks generate shot list button
**Then** System calls AI to analyze script
**And** Identifies scene transition points
**And** Generates shot sequence
**And** Assigns number to each shot

#### Scenario: Generate shots with character information

**Given** User is logged in
**And** Script is parsed
**And** Characters are defined
**When** User generates shot list
**Then** System identifies characters in shots
**And** Associates characters to shots
**And** Labels character positions

### Requirement: Shot Creation

The system MUST allow users to manually create shots.

#### Scenario: Create basic shot

**Given** User is logged in
**And** User has project edit permission
**When** User enters action summary and camera movement
**And** Selects associated scene
**And** Clicks save button
**Then** System creates new shot
**And** Auto-assigns shot number

#### Scenario: Create shot with character references

**Given** User is logged in
**And** Characters are defined
**When** User creates shot
**And** Selects characters in shot
**Then** System associates characters to shot
**And** Saves character references

### Requirement: Shot Editing

The system MUST allow users to edit shot information.

#### Scenario: Edit shot action description

**Given** User is logged in
**And** Shot is created
**When** User modifies action summary
**Then** System updates action description
**And** Saves update time

#### Scenario: Edit shot duration

**Given** User is logged in
**And** Shot is created
**When** User modifies shot duration (e.g., 4s, 8s, 16s)
**Then** System updates shot duration
**And** Saves update time

### Requirement: Shot Deletion

The system MUST allow users to delete shots.

#### Scenario: Delete single shot

**Given** User is logged in
**And** User has project edit permission
**And** Shot is created
**When** User deletes shot
**Then** System deletes shot
**And** Renumbers subsequent shots
**And** Deletes associated keyframes and video

### Requirement: Shot Sorting

The system MUST allow users to reorder shots.

#### Scenario: Drag and drop shot sorting

**Given** User is logged in
**And** User has project edit permission
**And** Shot list is created
**When** User drags shot to new position
**Then** System updates shot order
**And** Renumbers shots

### Requirement: Shot Copy

The system MUST allow users to copy shots.

#### Scenario: Copy shot to same position

**Given** User is logged in
**And** User has project edit permission
**And** Shot is created
**When** User clicks copy button
**Then** System creates shot copy
**And** Copy inserted after original shot
**And** Copies all associated data (keyframes, prompts, etc.)

### Requirement: Shot Split

The system MUST allow users to split shots into multiple sub-shots.

#### Scenario: Split shot

**Given** User is logged in
**And** User has project edit permission
**And** Shot is created
**When** User selects split position (e.g., split into 4 sub-shots)
**And** Clicks split button
**Then** System calls AI to analyze shot
**And** Generates sub-shot sequence
**And** Keeps original shot as reference

### Requirement: Shot Details

The system MUST allow users to view shot details.

#### Scenario: View shot basic information

**Given** User is logged in
**And** Shot is created
**When** User accesses shot detail page
**Then** System displays shot number
**And** Displays action summary
**And** Displays camera movement
**And** Displays associated scene
**And** Displays associated characters

#### Scenario: View shot keyframes

**Given** User is logged in
**And** Shot has keyframes
**When** User accesses shot detail page
**Then** System displays start frame image
**And** Displays end frame image
**And** Displays keyframe prompts

### Requirement: Shot Search and Filtering

The system MUST support shot search and filtering.

#### Scenario: Search shots by action keywords

**Given** User is logged in
**And** Project contains multiple shots
**When** User enters action keywords
**Then** System displays matching shots
**And** Highlights matching content

#### Scenario: Filter shots by scene

**Given** User is logged in
**And** Project contains multiple scenes
**When** User selects specific scene
**Then** System displays only shots from that scene

### Requirement: Shot Preview

The system MUST provide shot preview functionality.

#### Scenario: Preview shot sequence

**Given** User is logged in
**And** Shot list is created
**When** User clicks preview button
**Then** System plays shot sequence
**And** Each shot displays keyframes
**And** Displays shot duration

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## Cross-References

- Related to **Project Management** capability: Shots belong to project
- Related to **Content Management** capability: Shots generated from script
- Related to **Scene Management** capability: Shots associated with scenes
- Related to **Character Management** capability: Shots use characters
- Related to **Keyframe Management** capability: Shots contain keyframes
- Related to **Video Generation** capability: Shots generate video
