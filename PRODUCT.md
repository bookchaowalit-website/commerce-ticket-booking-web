# Box Office (ticket booking) — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `ticket-booking`) on 2026-10-23.

## What it is

A client-only seat-map demo: one show, four rows of eight seats with a fixed set unavailable, and booking stubs kept in this browser's localStorage. No payment, event backend or remote reservation.

## Who it is for

A portfolio visitor who wants to try a small seat-picking interaction.

## What works today

1. Pick and unpick open seats; the counters show seats remaining and selected.
2. Reserve with a name: a stub (name, seats, date) is saved in localStorage and the seats turn unavailable. Seats booked earlier in this browser stay unavailable after a reload; a booking for a taken or unknown seat is refused.
3. Recent bookings lists the last four stubs from this browser. A saved value of the wrong shape is ignored instead of breaking the page.
4. `/api/mcp` answers JSON-RPC with `get_seat_map` and `get_row` over the fixed authored map only (the server never sees visitor bookings); unknown tools and methods get JSON-RPC errors.
5. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No event creation, time slots, confirmation emails, QR tickets, check-in dashboard or fee claims (removed from the portfolio card in the 2026-10 review).
- No payment and no shared reservation: bookings exist only in the visitor's browser, so two visitors can book the same seat.
- No account, cancel or edit of a stub.

## Live URL and deploy state

- Live: https://ticket-booking.bookchaowalit.com (HTTP 200 on 2026-10-23).
- The Vercel project `bookchaowalit-ticket-booking-frontend` is deployed only by CLI. Its last production deploy is the CVE patch (2026-10-23, CLI, commit d7038be). Its Git link names the old repository `bookchaowalit/bookchaowalit-ticket-booking-frontend`, so a push to `main` does not deploy: the L2 work stays undeployed until the owner reconnects Vercel Git to this repository (owner action D9). `NEXT_PUBLIC_SENTRY_DSN` is already set on the Vercel project (Sentry project `commerce-ticket-booking-web`, org `personal-yu0`).

## Boundaries

- Browser-only apart from the stateless `/api/mcp` route.
