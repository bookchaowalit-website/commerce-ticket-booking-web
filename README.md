# Box Office (ticket booking)

A one-show seat map: pick open seats, leave a name and keep the booking stub in this browser. Seats you booked stay taken after a reload. Demo data only; no payment or shared reservation.

Live: https://ticket-booking.bookchaowalit.com (deployed by Vercel CLI; it can lag `main`, see `PRODUCT.md`).

## What it does not do

- No payment, email, QR tickets, events or check-in. Bookings are not shared between visitors or devices.

## Run

```bash
npm ci
npm run dev
```

## Checks

```bash
npm test           # Vitest: seat map and booking rules, local store, MCP route, home page render, Sentry scrubbing
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs the shared Node workflow (with a line-coverage gate) and the shared security
scan on every push and PR to `main`.

## Code map

- `lib/ticket-booking.ts`: the fixed seat map, booking rules (`createBooking`, `seatsWithBookings`), stub parsing and the localStorage store.
- `lib/local-store.ts`: small localStorage store for `useSyncExternalStore` (hydration-safe, works when storage is blocked).
- `app/api/mcp/route.ts`: stateless JSON-RPC endpoint with `get_seat_map` and `get_row` over the fixed map.
- `lib/sentry.ts` + `instrumentation*.ts`: error reporting to Sentry, errors only, personal data stripped; off when `NEXT_PUBLIC_SENTRY_DSN` is unset.
- `app/more-projects/page.tsx`: shared portfolio link page (copied per repository, not a package).
