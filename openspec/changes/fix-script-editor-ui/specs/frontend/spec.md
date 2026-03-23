# Capability: frontend

## Overview

This capability covers the frontend UI components and pages, including the Script Editor page and Model Selector component.

## ADDED Requirements

### Requirement: Script Editor Page Background and Overflow

The Script Editor page **SHALL** display consistent background color when scrolling vertically and **SHALL NOT** show white areas when scrolling horizontally.

#### Scenario: Vertical scroll shows consistent dark background

**Given** the user opens the Script Editor page in dark mode
**When** the user scrolls down to see more content
**Then** the background should remain `var(--bg-page)` color without showing white gaps

#### Scenario: Horizontal overflow is prevented

**Given** the user opens the Script Editor page
**When** the user attempts to scroll horizontally
**Then** the page **SHALL NOT** overflow and show white areas

---

### Requirement: Model Selector Empty State

The Model Selector component **SHALL** display a friendly empty state when no models are available and **SHALL** provide a way to navigate to model configuration.

#### Scenario: Empty state shows management entry point

**Given** the user opens the Model Selector dropdown
**When** no AI models are configured for the current content type
**Then** the component **SHALL** display "未找到匹配的模型" message with an "添加新模型" or "管理模型" button

#### Scenario: Empty state navigation

**Given** the user sees the empty state in Model Selector
**When** the user clicks the "管理模型" button
**Then** the user **SHALL** be navigated to the AI Providers configuration page

---

### Requirement: Script Editor Scroll Container

The editor section of Script Editor page **SHALL** provide smooth vertical scrolling within the editor area.

#### Scenario: Editor content scrolls within container

**Given** the user has a long script content in the editor
**When** the user scrolls within the editor section
**Then** only the editor section **SHALL** scroll, not the entire page

#### Scenario: Background remains fixed during editor scroll

**Given** the user scrolls within the editor section
**When** the scroll reaches the top or bottom boundaries
**Then** the page background **SHALL** remain visible without gaps

---

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

---

## Related Capabilities

- `enhance-light-mode`: Theme system that provides CSS variables
- `refactor-ui-pages`: Page structure and CSS variable standards