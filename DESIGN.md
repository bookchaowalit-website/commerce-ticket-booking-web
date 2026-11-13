# Design system — Ticket Booking

## Overview

Ticket booking is framed as a neighborhood box office: a printed showbill introduces the seat map, a dark theater window holds the interaction, and local booking stubs sit below.

## Colors

- #EEE9DF — showbill paper and window paper.
- #202735 — theater panel navy.
- #C94734 — box-office red for reservation actions.
- #E0A34B — marquee gold for selection and labels.
- #767B83 — secondary ticket ink.

## Typography

Georgia gives the showbill its human editorial voice. Trebuchet MS handles utility copy, while Courier New is reserved for ticket metadata and seat labels.

## Layout

The page follows a ticketing ritual: show title, stage line, seat map, reservation window, then local stubs. The seat map owns the large dark panel; the form is a distinct paper window beside it and stacks below on mobile.

## Elevation & Depth

The dark theater panel is the main depth move. The paper reservation window is a contrasting plane rather than a floating card; seat availability is expressed by fill and disabled state.

## Shapes

Seats are square and compact like a printed plan. Controls use simple rectangles, rules, and a single red action field.

## Components

- Showbill header
- Stage line and seat legend
- Interactive A–D seat map
- Reservation window with name field
- Local booking stubs

## Do's and Don'ts

- Do make taken, selected, and open seats legible without color alone.
- Do keep payment and remote reservation limitations visible.
- Don't imply real inventory, checkout, payment, or confirmation email.
- Don't bury the seat map inside generic cards or make the interaction decorative.


---

## Storybook

Storybook 10 (`@storybook/nextjs-vite`) shows this design system with the app's real CSS, tokens and fonts.

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # static build in storybook-static/ (CI: .github/workflows/storybook.yml)
```

- **Foundations/Tokens** reads every CSS custom property the app defines at runtime, so it never drifts from the code.
- **Design/DESIGN.md** renders this file.
- **Components/**, **Sections/** and **Pages/** show the UI with mock data only (no network, analytics off).
- Toolbar: locale, theme (light / dark, when the app has a dark theme), viewports 320 / 375 / 768 / 1440. The a11y panel runs axe (WCAG 2.2 AA).
- Rule: a new shared component or page section ships with a story in `stories/`.
