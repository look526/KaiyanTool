# Design System Tokens

## ADDED Requirements

### Requirement: Color Tokens

The system SHALL provide a comprehensive color token system with primary, accent, semantic, and theme-specific colors.

#### Scenario: Apply primary color
- Given a component uses `var(--color-primary)`
- When the component renders
- Then the color SHALL be `#007AFF` (Apple Blue)

#### Scenario: Apply accent colors for Bento cards
- Given a BentoGradientCard uses `accent="purple"`
- When the component renders
- Then the color SHALL be `#AF52DE`

#### Scenario: Switch theme colors
- Given the theme is switched from light to dark
- When the theme change is applied
- Then `--bg-primary` SHALL change from `#FFFFFF` to `#000000`
- And `--text-primary` SHALL change from `#000000` to `#FFFFFF`

### Requirement: Typography Tokens

The system SHALL provide typography tokens for font family, size, weight, and line height.

#### Scenario: Apply font family
- Given a component uses `var(--font-family-sans)`
- When the component renders
- Then the font SHALL be 'Inter' with fallbacks to system fonts

#### Scenario: Apply font size
- Given a component uses `var(--font-size-lg)`
- When the component renders
- Then the font size SHALL be 18px

### Requirement: Spacing Tokens

The system SHALL provide spacing tokens based on a 4px grid system.

#### Scenario: Apply spacing
- Given a component uses `var(--spacing-4)`
- When the component renders
- Then the spacing SHALL be 16px

#### Scenario: Apply padding using spacing tokens
- Given a BentoCard uses `padding: var(--spacing-6)`
- When the component renders
- Then the padding SHALL be 24px

### Requirement: Border Radius Tokens

The system SHALL provide border radius tokens for consistent rounded corners.

#### Scenario: Apply card border radius
- Given a BentoCard uses `border-radius: var(--radius-xl)`
- When the component renders
- Then the border radius SHALL be 20px

#### Scenario: Apply button border radius
- Given a Button uses `border-radius: var(--radius-md)`
- When the component renders
- Then the border radius SHALL be 10px

### Requirement: Shadow Tokens

The system SHALL provide shadow tokens with theme-aware variants.

#### Scenario: Apply card shadow in dark mode
- Given a BentoCard is rendered in dark mode
- When the component renders
- Then the shadow SHALL be `0 4px 12px rgba(0, 0, 0, 0.15)`

#### Scenario: Apply hover shadow
- Given a BentoCard is hovered
- When the hover state is active
- Then the shadow SHALL be `0 8px 24px rgba(0, 0, 0, 0.2)`

### Requirement: Animation Tokens

The system SHALL provide animation timing and easing tokens.

#### Scenario: Apply transition timing
- Given a component uses `transition: all var(--transition-normal)`
- When the component animates
- Then the transition SHALL take 200ms with ease timing

#### Scenario: Apply entry animation
- Given a BentoCard mounts
- When the animation plays
- Then the animation SHALL be fadeInUp with 0.5s duration
