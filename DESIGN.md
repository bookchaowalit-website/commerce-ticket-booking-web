# Ticket Booking — Box Office

Since 2026-11-19 the box office uses the shared **App shell** (`app/app-shell.css`, `components/app-shell.tsx`,
see `APP-SHELL.md`): Geist via next/font, the `--as-*` light/dark tokens (no hard-coded colours outside them,
apart from white text on the selected seat), the shell top bar, fields, buttons and footer (with the link back
to bookchaowalit.com). Box-office pieces (`.tb-*`) live in `app/globals.css`.

- Head: title and one honest sentence, then the seat map in the first screen.
- Seats are 44px buttons with `aria-pressed`; on phones each row splits into two half-rows of four.
- Unavailable seats are struck through on a striped, dashed tile and named "unavailable" for screen readers,
  so the state never rests on colour alone.
- The reservation form says what is missing ("enter a name and choose at least one open seat") instead of only
  dimming Reserve. On phones a bar right after the seat map (in the page flow, never floating over seats) shows the selection count and jumps to the form.
- Bookings made in this browser are listed below, with an empty state.

Bookings stay in the visitor's browser; nothing is paid, sent or held anywhere else.
