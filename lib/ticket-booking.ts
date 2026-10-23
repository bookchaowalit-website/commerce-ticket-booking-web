// Box office: the fixed seat map, booking rules and the browser-local booking stubs.
import { browserStorage, createLocalStore } from "@/lib/local-store";

export type Seat = { id: string; taken: boolean };
export type Booking = { name: string; seats: string[]; at: number };

export const ROWS = ["A", "B", "C", "D"] as const;
export const SEATS_PER_ROW = 8;
export const STORAGE_KEY = "ticket-booking-v2";

/** The authored map: a fixed pattern of seats is unavailable before anyone books. */
export const INITIAL_SEATS: Seat[] = ROWS.flatMap((row) =>
  Array.from({ length: SEATS_PER_ROW }, (_, index) => ({ id: row + (index + 1), taken: (index + row.charCodeAt(0)) % 5 === 0 })),
);

/** Seats booked in this browser stay unavailable, also after a reload. */
export function seatsWithBookings(bookings: Booking[], base: Seat[] = INITIAL_SEATS): Seat[] {
  const booked = new Set(bookings.flatMap((booking) => booking.seats));
  return base.map((seat) => (booked.has(seat.id) ? { ...seat, taken: true } : seat));
}

export function seatsInRow(seats: Seat[], row: string): Seat[] {
  return seats.filter((seat) => seat.id.startsWith(row));
}

export function countAvailable(seats: Seat[]): number {
  return seats.filter((seat) => !seat.taken).length;
}

export function toggleSeat(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((seat) => seat !== id) : [...selected, id];
}

/** A booking needs a name and at least one open seat; seats already taken or unknown are refused (null). */
export function createBooking(seats: Seat[], name: string, selected: string[], at: number = Date.now()): Booking | null {
  const trimmed = name.trim();
  if (!trimmed || selected.length === 0) return null;
  const open = new Set(seats.filter((seat) => !seat.taken).map((seat) => seat.id));
  if (!selected.every((id) => open.has(id))) return null;
  return { name: trimmed, seats: [...selected], at };
}

function isBooking(value: unknown): value is Booking {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.name === "string" &&
    typeof entry.at === "number" &&
    Array.isArray(entry.seats) &&
    entry.seats.every((seat) => typeof seat === "string")
  );
}

/** Saved stubs, or null when nothing usable is saved; entries of the wrong shape are dropped. */
export function parseBookings(raw: string | null): Booking[] | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isBooking) : null;
  } catch {
    return null;
  }
}

export const NO_BOOKINGS: Booking[] = [];

export const bookingStore = createLocalStore<Booking[]>({
  key: STORAGE_KEY,
  fallback: NO_BOOKINGS,
  parse: parseBookings,
  serialize: (bookings) => JSON.stringify(bookings),
  getStorage: browserStorage,
});
