# Add light, dark, and system appearance themes

## Scope
- Preserve the existing dark theme exactly and keep all layouts, pages, data, and interactions unchanged.
- Add a global appearance preference with Dark, Light, and System modes.
- Persist the choice locally and apply it before the interface paints to minimize theme flashing.

## Implementation
- Add a small theme provider that resolves System against the device preference, updates when that preference changes, and exposes the active selection to Settings.
- Define a complete professional light palette through the existing semantic CSS variables, including surfaces, typography, borders, status colors, chart colors, shadows, scrollbars, and map controls.
- Make the map choose an appropriate CARTO basemap and update immediately when the resolved theme changes, while keeping markers, road lines, heatmaps, and labels readable.
- Add an Appearance panel to Settings with accessible Dark, Light, and System choices, descriptions, selected-state feedback, and keyboard focus states.
- Add a restrained global color transition that respects reduced-motion preferences.

## Validation
- Verify Dark → Light, Light → Dark, Light → System, and System → Light, including persistence after refresh.
- Review all routes in both themes for readable maps, charts, tables, drawers, sidebar, Copilot, borders, hover states, and severity indicators.
- Confirm the app remains error-free.

## Technical details
- Theme preference key: `urbansense-theme`.
- The root element will use `.dark` or `.light` plus `data-theme` and `color-scheme`.
- Existing component classes continue using semantic tokens; only theme infrastructure, token definitions, map theme handling, and Settings appearance UI change.
