# Spec Delta: Project Management

## ADDED Requirements

### Requirement: User Registration and Login

The system MUST provide user registration and login functionality with JWT authentication.

#### Scenario: User registers new account

**Given** User is not logged in
**When** User enters valid email and password
**Then** System creates new user account
**And** Returns JWT token
**And** User can access protected resources

#### Scenario: User logs in

**Given** User is registered
**When** User enters correct email and password
**Then** System verifies credentials
**And** Returns JWT token
**And** User can access protected resources

### Requirement: Project Creation

The system MUST allow users to create new projects supporting three types: script, novel, and mixed.

#### Scenario: Create script type project

**Given** User is logged in
**When** User selects "script" type and enters project name
**Then** System creates new project
**And** Project type is "script"
**And** User becomes project owner

#### Scenario: Create novel type project

**Given** User is logged in
**When** User selects "novel" type and enters project name
**Then** System creates new project
**And** Project type is "novel"
**And** User becomes project owner

### Requirement: Project List Query

The system MUST allow users to query project list with pagination and filtering.

#### Scenario: Query user's project list

**Given** User is logged in
**When** User accesses project list page
**Then** System returns all projects user has access to
**And** Projects are ordered by creation time descending

#### Scenario: Filter by project type

**Given** User is logged in
**When** User selects "script" type filter
**Then** System returns only projects with type "script"

### Requirement: Project Detail Query

The system MUST allow users to query project details including related characters, scenes, and shots.

#### Scenario: Query project basic information

**Given** User is logged in
**And** User has project access permission
**When** User accesses project detail page
**Then** System returns project basic information
**And** Includes project name, description, type, creation time

#### Scenario: Query project related data

**Given** User is logged in
**And** User has project access permission
**When** User accesses project detail page
**Then** System returns project related character list
**And** System returns project related scene list
**And** System returns project related shot list

### Requirement: Project Update

The system MUST allow project owners and editors to update project information.

#### Scenario: Update project name

**Given** User is logged in
**And** User is project owner or editor
**When** User modifies project name
**Then** System updates project name
**And** Saves update time

#### Scenario: No permission to update project

**Given** User is logged in
**And** User is project viewer
**When** User tries to update project information
**Then** System returns 403 error
**And** Prompts insufficient permissions

### Requirement: Project Deletion

The system MUST allow project owners to delete projects.

#### Scenario: Delete project

**Given** User is logged in
**And** User is project owner
**When** User confirms project deletion
**Then** System deletes project
**And** Deletes all related data (characters, scenes, shots, etc.)

### Requirement: Project Member Management

The system MUST support project member management including adding, removing, and role assignment.

#### Scenario: Add project member

**Given** User is logged in
**And** User is project owner
**When** User adds member by email
**And** Assigns role as "editor"
**Then** System adds member to project
**And** Sends invitation email
**And** Member gains edit permissions

#### Scenario: Update member role

**Given** User is logged in
**And** User is project owner
**When** User changes member role from "editor" to "viewer"
**Then** System updates member role
**And** Member permissions change accordingly

### Requirement: Project Export

The system MUST allow users to export project data in JSON format.

#### Scenario: Export complete project

**Given** User is logged in
**And** User has project access permission
**When** User clicks export button
**Then** System generates JSON file
**And** File contains project basic information
**And** File contains all related data (characters, scenes, shots, etc.)

### Requirement: Project Import

The system MUST allow users to import project data in JSON format.

#### Scenario: Import project

**Given** User is logged in
**When** User uploads valid project JSON file
**Then** System validates file format
**And** Creates new project
**And** Imports all related data
**And** User becomes project owner

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## Cross-References

- Related to **Character Management** capability: Project contains character list
- Related to **Scene Management** capability: Project contains scene list
- Related to **Shot Management** capability: Project contains shot list
- Related to **Content Management** capability: Project contains content (script/novel)
