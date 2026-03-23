# Design System: The Cinematic Intelligence Framework

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built to transcend the "utility tool" aesthetic, positioning itself instead as a high-end editorial stage for AI-driven creativity. Our Creative North Star is **The Digital Curator**: a philosophy where the UI acts as a sophisticated, dark gallery that recedes to let AI-generated content take center stage. 

We break the "template" look by rejecting rigid, opaque grids in favor of **Luminous Asymmetry**. By using overlapping glass surfaces, varying blur densities, and intentional whitespace, we create a sense of depth that feels more like a physical high-end studio than a digital dashboard. Every element must feel light, as if it is floating in a pressurized, midnight vacuum.

---

## 2. Colors: Tonal Depth & Neon Soul
The palette is rooted in deep obsidian and midnight tones, punctuated by high-energy violets and cyans.

### The Palette (Core Tokens)
- **Primary (Vibrant Purple):** `#ba9eff` (Surface Tint / Glow)
- **Primary Container:** `#ae8dff` (Main Action Base)
- **Secondary (Neon Cyan):** `#34b5fa` (Progress & Accents)
- **Tertiary (Electric Magenta):** `#ec63ff` (Creative Spark)
- **Background:** `#070d1f` (The Void)

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for structural sectioning. To define boundaries, use **Tonal Transitions**. A section should be distinguished from the background by shifting from `surface` to `surface-container-low`. Boundaries are felt through color weight, not drawn with lines.

### The "Glass & Gradient" Rule
To achieve a "signature" feel, static flat colors should be avoided for primary surfaces. 
- **The Signature Gradient:** Use a linear gradient (135°) from `primary` to `primary-dim` for high-impact CTAs.
- **Glassmorphism:** All floating panels must use a semi-transparent `surface-variant` (at 40-60% opacity) combined with a `backdrop-filter: blur(20px to 40px)`.

---

## 3. Typography: Editorial Authority
We utilize two distinct typefaces to balance futuristic technicality with high-end readability.

*   **Display & Headlines (Plus Jakarta Sans):** Used for "The Hook." This font features exaggerated ink traps and a modern geometric structure. It should be used with tight letter-spacing (-0.02em) to create a bold, authoritative "editorial" feel.
*   **Body & Labels (Manrope):** Selected for its exceptional legibility in dark environments. The generous x-height ensures that even at `body-sm`, AI prompts and technical metadata remain crisp.

**Hierarchy Strategy:**
- **Display-LG (3.5rem):** Reserved for hero statements or AI generation titles.
- **Headline-MD (1.75rem):** Used for card titles to give them a "magazine" feel.
- **Label-MD (0.75rem):** Styled with `0.1em` letter-spacing and uppercase for technical AI parameters (e.g., "SEED RATIO").

---

## 4. Elevation & Depth: The Stacking Principle
Depth in this system is not about distance from the user, but about the **refraction of light**.

### Tonal Layering
Instead of shadows, we "stack" tiers:
1.  **Level 0 (Base):** `surface` (#070d1f)
2.  **Level 1 (Sections):** `surface-container-low`
3.  **Level 2 (Cards):** `surface-container-highest` (at 60% opacity with blur)

### Ambient Shadows
When a component must "float" (like a dropdown or modal), use an **Ambient Glow** instead of a grey shadow.
- **Shadow Token:** Blur 40px, Spread 0, Color: `primary` at 8% opacity. This mimics the light of the screen hitting the surface behind the element.

### The "Ghost Border" Fallback
If an element needs a boundary (like an input field), use a **Ghost Border**: a 1px stroke using the `outline-variant` token at 20% opacity. It should feel like a faint reflection on the edge of a glass pane, not a container wall.

---

## 5. Signature Components

### GlassButton (Primary)
- **Base:** Gradient (`primary` to `primary-dim`).
- **Corner Radius:** `14px`.
- **Interaction:** On hover, increase `surface-tint` glow intensity and scale by 1.02x.
- **Text:** `label-md` (bold), color: `on-primary`.

### GlassCard (The Workspace)
- **Backdrop:** `surface-container-highest` (40% opacity).
- **Blur:** `30px`.
- **Border:** 1px "Ghost Border" (`outline-variant` at 15%).
- **Corner Radius:** `xl` (3rem) for external containers; `lg` (2rem) for internal content cards.
- **Rule:** No internal dividers. Use `spacing-6` (2rem) of vertical white space to separate headlines from body text.

### GlassInput (The Prompt Engine)
- **Background:** `surface-container-lowest` (inset feel).
- **Border:** `outline-variant` at 10%. On focus, the border transitions to a 1px solid `primary` with a 4px soft glow.
- **Typography:** `body-lg`.

### GlassBadge (Metadata)
- **Style:** Semi-transparent `secondary-container` with a high `backdrop-blur`.
- **Corner Radius:** `full`.
- **Usage:** Used for AI model tags (e.g., "GPT-4", "Sora v1").

---

## 6. Do's and Don'ts

### Do:
- **Use Intentional Asymmetry:** Align text to the left but place a glowing "creative spark" (tertiary color) in the top right to draw the eye.
- **Embrace the Blur:** Allow background imagery (AI art) to bleed under glass panels to create a sense of immersion.
- **Use "Tonal Shifts":** Separate the sidebar from the main stage using `surface-container-low` vs `surface`.

### Don't:
- **Don't use 100% Black:** Pure black (#000000) kills the glass effect. Use `surface` (#070d1f) to keep the "midnight" depth.
- **Don't use Sharp Corners:** Never go below `14px` (Buttons). The AI aesthetic should feel organic and approachable, not industrial.
- **Don't Overcrowd:** If a layout feels busy, remove a border and increase the `spacing-8` (2.75rem) gap. Space is luxury.

### Accessibility Note:
While glassmorphism is aesthetic, ensure all `on-surface` text maintains a 4.5:1 contrast ratio against the blurred background. Use the `primary-fixed-dim` token for secondary actions to ensure visibility without breaking the dark-mode immersion.