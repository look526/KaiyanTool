# Spec Delta: AI Agent System

## ADDED Requirements

### Requirement: AI Provider Management

The system MUST support multiple AI providers and allow users to configure and manage API keys.

#### Scenario: Add AI provider

**Given** User is logged in
**When** User selects provider type (OpenAI, Google, ZhipuAI, Custom)
**And** Enters API key
**And** Clicks save button
**Then** System validates API key
**And** Saves provider configuration
**And** API key stored encrypted

#### Scenario: Edit provider configuration

**Given** User is logged in
**And** AI provider is configured
**When** User modifies API key
**And** Clicks save button
**Then** System validates new API key
**And** Updates provider configuration

### Requirement: AI Model Configuration

The system MUST allow users to select and configure different AI models.

#### Scenario: View available models

**Given** User is logged in
**And** AI provider is configured
**When** User accesses model configuration page
**Then** System displays all models supported by provider
**And** Displays model type (text, image, video)
**And** Displays model parameters

#### Scenario: Select text generation model

**Given** User is logged in
**And** User needs to generate text
**When** User selects text model (e.g., GPT-5.1, Gemini 3 Pro, GLM-4)
**Then** System saves model selection
**And** Subsequent text generation uses that model

### Requirement: Storyline Agent (AI1)

The system MUST provide storyline generation Agent capable of analyzing novel content and generating storyline.

#### Scenario: Generate storyline

**Given** User is logged in
**And** Novel content is uploaded
**When** User clicks generate storyline button
**Then** System calls AI1 Agent to analyze novel
**And** Extracts main conflict and theme
**And** Identifies key plots
**And** Generates structured storyline

### Requirement: Outline Agent (AI2)

The system MUST provide outline generation Agent capable of generating detailed outline based on storyline.

#### Scenario: Generate outline

**Given** User is logged in
**And** Storyline is generated
**When** User sets episode count (e.g., 10)
**And** Clicks generate outline button
**Then** System calls AI2 Agent
**And** Divides storyline into specified episodes
**And** Each episode contains detailed scenes
**And** Maintains character consistency

### Requirement: Director Agent

The system MUST provide Director Agent capable of converting outline to detailed script.

#### Scenario: Generate script from outline

**Given** User is logged in
**And** Outline is generated
**When** User clicks generate script button
**Then** System calls Director Agent
**And** Converts outline to script format
**And** Adds shot information
**And** Adds character actions and expressions

### Requirement: Storyboard Agent

The system MUST provide Storyboard Agent capable of converting script to nine-grid storyboard.

#### Scenario: Generate storyboard

**Given** User is logged in
**And** Script is generated
**When** User clicks generate storyboard button
**Then** System calls Storyboard Agent
**And** Divides shots into 4-9 segments
**And** Generates nine-grid prompt for each segment
**And** Maintains visual consistency

### Requirement: Agent Task Management

The system MUST support creating, monitoring, and managing Agent tasks.

#### Scenario: Create Agent task

**Given** User is logged in
**When** User triggers Agent functionality (e.g., generate storyline)
**Then** System creates Agent task record
**And** Records task type, input data, selected model
**And** Sets status to "pending"

#### Scenario: Monitor task progress

**Given** User is logged in
**And** Agent task is executing
**When** User accesses task monitoring page
**Then** System displays task status
**And** Displays task progress
**And** Displays elapsed time

### Requirement: Agent Task History

The system MUST save Agent task history supporting viewing and retry.

#### Scenario: View task history

**Given** User is logged in
**And** Project has multiple Agent tasks
**When** User accesses task history page
**Then** System displays all task records
**And** Displays task type, status, time
**And** Ordered by time descending

### Requirement: Agent Parameter Configuration

The system MUST allow users to configure Agent runtime parameters.

#### Scenario: Configure text generation parameters

**Given** User is logged in
**And** User prepares to use text generation Agent
**When** User sets temperature parameter (e.g., 0.7)
**And** Sets max token count (e.g., 2000)
**Then** System saves parameter configuration
**And** Agent uses these parameters when running

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## Cross-References

- Related to **Content Management** capability: Agents generate content (storyline, outline, script)
- Related to **Shot Management** capability: Director Agent generates shot list
- Related to **Image Generation** capability: Storyboard Agent generates image prompts
- Related to **Project Management** capability: Agent tasks belong to project
