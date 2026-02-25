# Bento UI Components

## ADDED Requirements

### Requirement: Bento Grid Container Component

The system SHALL provide a BentoGrid container component that implements the Bento Grid layout system with responsive grid columns and configurable gaps.

#### Scenario: Render Bento Grid with default settings
- Given a BentoGrid component is rendered
- When no props are provided
- Then the grid SHALL use `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`
- And the gap SHALL be 16px
- And children SHALL be rendered inside the grid

#### Scenario: Render Bento Grid with custom columns
- Given a BentoGrid component is rendered with `columns={4}`
- When the component mounts
- Then the grid SHALL have 4 columns
- And each column SHALL have equal width

### Requirement: Bento Card Base Component

The system SHALL provide a BentoCard base component with consistent styling, hover effects, and theme support.

#### Scenario: Render Bento Card with default styling
- Given a BentoCard component is rendered
- When no props are provided
- Then the card SHALL have 16px-24px border radius
- And the card SHALL have subtle shadow
- And the card SHALL have 24px padding

#### Scenario: Bento Card hover effect
- Given a BentoCard component is rendered
- When the user hovers over the card
- Then the card SHALL translate up by 4px
- And the card SHALL scale to 1.02
- And the shadow SHALL increase

#### Scenario: Bento Card theme support
- Given a BentoCard component is rendered
- When the theme is dark
- Then the card background SHALL be `rgba(44, 44, 46, 0.8)`
- And the border SHALL be `rgba(255, 255, 255, 0.1)`

### Requirement: Bento Card Size Variants

The system SHALL provide BentoCard variants for different grid sizes: Small (1x1), Medium (1x2), Large (2x2), Wide (2x1), and Tall (1x2).

#### Scenario: Render Small Bento Card
- Given a BentoCardSmall component is rendered
- When the component mounts
- Then the card SHALL span 1 column and 1 row
- And the minimum width SHALL be 180px

#### Scenario: Render Large Bento Card
- Given a BentoCardLarge component is rendered
- When the component mounts
- Then the card SHALL span 2 columns and 2 rows
- And the minimum width SHALL be 360px

#### Scenario: Render Wide Bento Card
- Given a BentoCardWide component is rendered
- When the component mounts
- Then the card SHALL span 2 columns and 1 row

### Requirement: Bento Gradient Card

The system SHALL provide a BentoGradientCard component with gradient backgrounds in multiple accent colors.

#### Scenario: Render gradient card with purple accent
- Given a BentoGradientCard is rendered with `accent="purple"`
- When the component mounts
- Then the background SHALL be a gradient from `#AF52DE` to a darker shade
- And the text color SHALL be white

#### Scenario: Render gradient card with custom gradient
- Given a BentoGradientCard is rendered with `gradient="linear-gradient(135deg, #6366F1, #EC4899)"`
- When the component mounts
- Then the background SHALL use the custom gradient

### Requirement: Bento Stats Card

The system SHALL provide a BentoStatsCard component for displaying statistics with icon, value, and label.

#### Scenario: Render stats card with data
- Given a BentoStatsCard is rendered with `value="1,234"` and `label="Total Projects"`
- When the component mounts
- Then the value SHALL be displayed prominently
- And the label SHALL be displayed below the value
- And the card SHALL have appropriate styling for dark/light themes

### Requirement: Bento Action Card

The system SHALL provide a BentoActionCard component for clickable action items with icon and title.

#### Scenario: Render action card with click handler
- Given a BentoActionCard is rendered with `title="Create Project"` and `onClick` handler
- When the user clicks the card
- Then the onClick handler SHALL be called
- And the card SHALL show hover effect

### Requirement: Bento Image Card

The system SHALL provide a BentoImageCard component for displaying images with optional overlay content.

#### Scenario: Render image card with image URL
- Given a BentoImageCard is rendered with `src="/image.jpg"` and `alt="Project thumbnail"`
- When the component mounts
- Then the image SHALL be displayed with cover fit
- And the image SHALL have border radius matching the card

### Requirement: Bento Card Entry Animation

The system SHALL provide entry animations for Bento cards with staggered delays.

#### Scenario: Animate cards on mount
- Given multiple BentoCard components are rendered in a BentoGrid
- When the grid mounts
- Then each card SHALL animate with fadeInUp animation
- And each card SHALL have a staggered delay (0ms, 50ms, 100ms, etc.)
