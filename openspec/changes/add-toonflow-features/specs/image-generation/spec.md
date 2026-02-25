# Image Generation Spec Delta

## ADDED Requirements

### Requirement: Image Model Configuration

The system MUST support configuring multiple AI image generation models.

#### Scenario: Configure image generation model

**Given** User has admin permissions
**When** User selects image model on model configuration page
**And** Fills in API Key and other configurations
**Then** System saves configuration and validates connection

#### Scenario: Switch image generation model

**Given** User has configured multiple image models
**When** User selects a model to use
**Then** Subsequent image generation uses the selected model

### Requirement: Image Generation

The system MUST support generating single images and batch shot images.

#### Scenario: Generate single image

**Given** User is on image generation page
**When** User enters English prompt and clicks generate
**Then** System calls AI model to generate image
**And** Returns generated image for preview and download

#### Scenario: Generate shot image

**Given** User is on shot editing page
**When** User selects a shot and clicks generate image
**Then** System generates image based on shot description

#### Scenario: Batch generate shot images

**Given** User has multiple shots requiring image generation
**When** User clicks batch generate
**Then** System generates images for all shots in sequence
**And** Displays overall progress and status for each shot

### Requirement: Image Enhancement

The system MUST support image super-resolution enhancement.

#### Scenario: Enhance image

**Given** User has a generated image
**When** User clicks enhance button
**Then** System performs super-resolution processing on image
**And** Returns enhanced high-resolution image

### Requirement: Image Prompt Polish

The system MUST support converting Chinese descriptions to optimized English prompts.

#### Scenario: Optimize image prompt

**Given** User has Chinese description
**When** User clicks optimize prompt
**Then** System converts Chinese to optimized English prompt
**And** Displays optimized prompt for user to use
