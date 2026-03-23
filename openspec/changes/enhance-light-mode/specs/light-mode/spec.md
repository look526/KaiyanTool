# Spec: light-mode

## ADDED Requirements

### Requirement: Theme-Aware Rendering

All UI components MUST use CSS variables for colors instead of hardcoded values to support dynamic theme switching.

#### Scenario: Light mode rendering
Given the user has selected light theme in appearance settings
When the `ScriptEditorPage` is rendered
Then all background colors SHALL use CSS variables like `var(--bg-base)`, `var(--bg-surface)`, `var(--bg-card)`
And all text colors SHALL use CSS variables like `var(--text-primary)`, `var(--text-secondary)`
And all border colors SHALL use CSS variables like `var(--border-primary)`

#### Scenario: Dark mode rendering
Given the user has selected dark theme in appearance settings
When the `ScriptEditorPage` is rendered
Then it SHALL render with dark mode colors through CSS variables
And maintain the "Digital Curator" aesthetic with glow effects and gradients

### Requirement: Consistent Visual Hierarchy

The visual hierarchy MUST remain consistent across both themes.

#### Scenario: Navigation visibility in light mode
Given the user is in light mode
When viewing the left navigation rail
Then the active nav item SHALL be distinguishable with accent color
And inactive items SHALL have muted appearance
And hover states SHALL provide clear feedback

#### Scenario: Content readability in light mode
Given the user is in light mode
When viewing the main editor area
Then the text SHALL have sufficient contrast against the background (minimum 4.5:1 ratio)
And interactive elements SHALL be clearly identifiable

### Requirement: Monaco Editor Theme Switching

The Monaco editor MUST respond to theme changes.

#### Scenario: Editor theme follows system theme
Given the user switches from dark to light theme
When the editor is displayed
Then Monaco editor SHALL use the `vs-light` theme instead of `vs-dark`

---

## MODIFIED Requirements

### Requirement: Button Styling

Buttons MUST maintain consistent styling across light and dark themes.

#### Scenario: Primary button in light mode
Given the user is in light mode
When a primary action button is rendered
Then it SHALL use `var(--gradient-accent)` for background
And `var(--text-primary)` for text color
And maintain shadow effect `var(--shadow-accent)`

### Requirement: Card Styling

Card components MUST maintain glass morphism effect across themes.

#### Scenario: Glass card in light mode
Given the user is in light mode
When a glass card component is rendered
Then it SHALL use semi-transparent background with blur effect
And `var(--border-primary)` for border
And maintain proper contrast for content readability

---

## Cross-Reference

- Related to: `AppearanceSettingsPage` (theme switching UI)
- Related to: `ThemeContext` (theme state management)
- Related to: CSS Variables in `index.css` (light/dark mode definitions)
