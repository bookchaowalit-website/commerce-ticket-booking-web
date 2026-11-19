import { describe, expect, it } from "vitest";
import {
  INITIAL_SEATS,
  countAvailable,
  createBooking,
  parseBookings,
  seatsInRow,
  seatsWithBookings,
  toggleSeat,
  type Booking,
} from "@/lib/ticket-booking";

const openSeat = INITIAL_SEATS.find((seat) => !seat.taken)!.id;
const takenSeat = INITIAL_SEATS.find((seat) => seat.taken)!.id;

describe("seat map", () => {
  it("has four rows of eight seats with a fixed set unavailable", () => {
    expect(INITIAL_SEATS).toHaveLength(32);
    expect(seatsInRow(INITIAL_SEATS, "B").map((seat) => seat.id)).toEqual(["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"]);
    expect(countAvailable(INITIAL_SEATS)).toBe(26);
  });

  it("keeps seats booked in this browser unavailable after a reload (no double booking)", () => {
    const saved: Booking[] = [{ name: "Ada", seats: [openSeat], at: 1 }];
    const seats = seatsWithBookings(saved);
    expect(seats.find((seat) => seat.id === openSeat)?.taken).toBe(true);
    expect(countAvailable(seats)).toBe(25);
    expect(createBooking(seats, "Bob", [openSeat], 2)).toBeNull();
  });

  it("does not change the authored map", () => {
    seatsWithBookings([{ name: "Ada", seats: [openSeat], at: 1 }]);
    expect(INITIAL_SEATS.find((seat) => seat.id === openSeat)?.taken).toBe(false);
  });
});

describe("toggleSeat", () => {
  it("adds a seat, then removes it again", () => {
    expect(toggleSeat([], "A2")).toEqual(["A2"]);
    expect(toggleSeat(["A2", "A3"], "A2")).toEqual(["A3"]);
  });
});

describe("createBooking", () => {
  it("trims the name and copies the seats", () => {
    const selected = [openSeat];
    const booking = createBooking(INITIAL_SEATS, "  Ada  ", selected, 5);
    expect(booking).toEqual({ name: "Ada", seats: [openSeat], at: 5 });
    expect(booking?.seats).not.toBe(selected);
  });

  it("refuses a blank name, no seats, a taken seat or an unknown seat", () => {
    expect(createBooking(INITIAL_SEATS, "   ", [openSeat], 1)).toBeNull();
    expect(createBooking(INITIAL_SEATS, "Ada", [], 1)).toBeNull();
    expect(createBooking(INITIAL_SEATS, "Ada", [takenSeat], 1)).toBeNull();
    expect(createBooking(INITIAL_SEATS, "Ada", ["Z9"], 1)).toBeNull();
  });
});

describe("parseBookings", () => {
  it("returns null for nothing saved, bad JSON or a non-array", () => {
    expect(parseBookings(null)).toBeNull();
    expect(parseBookings("{oops")).toBeNull();
    expect(parseBookings('{"name":"Ada"}')).toBeNull();
  });

  it("drops entries of the wrong shape instead of crashing the page", () => {
    const raw = JSON.stringify([{ name: "Ada", seats: ["A2"], at: 1 }, { name: "No seats", at: 2 }, { name: "Bad", seats: [3], at: 3 }, null]);
    expect(parseBookings(raw)).toEqual([{ name: "Ada", seats: ["A2"], at: 1 }]);
  });

  it("drops stubs whose time a Date cannot show, so the page never meets an Invalid Date or a RangeError", () => {
    const raw = JSON.stringify([{ name: "Ada", seats: ["A2"], at: 1 }, { name: "Too late", seats: ["A3"], at: 9e15 }, { name: "Too early", seats: ["A4"], at: -9e15 }]);
    expect(parseBookings(raw)).toEqual([{ name: "Ada", seats: ["A2"], at: 1 }]);
    // NaN / Infinity serialise to null, which is not a number either.
    expect(parseBookings('[{"name":"Nil","seats":["A5"],"at":null}]')).toEqual([]);
    expect(parseBookings('[{"name":"Edge","seats":["A6"],"at":8.64e15}]')).toEqual([{ name: "Edge", seats: ["A6"], at: 8.64e15 }]);
  });
});
