"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { AppFoot, AppTop } from "@/components/app-shell";
import { ROWS, bookingStore, countAvailable, createBooking, seatsInRow, seatsWithBookings, toggleSeat } from "@/lib/ticket-booking";

const stubDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export default function Home() {
  const bookings = useSyncExternalStore(bookingStore.subscribe, bookingStore.getSnapshot, bookingStore.getServerSnapshot);
  const seats = seatsWithBookings(bookings);
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const selected = picked.filter((id) => seats.some((seat) => seat.id === id && !seat.taken));
  const available = countAvailable(seats);
  const missing = [!name.trim() ? "enter a name" : "", selected.length === 0 ? "choose at least one open seat" : ""].filter(Boolean);
  const toggle = (id: string) => setPicked((current) => toggleSeat(current, id));
  const book = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const booking = createBooking(seats, name, selected);
    if (!booking) return;
    bookingStore.update((current) => [booking, ...current]);
    setAnnouncement(`Reserved ${booking.seats.join(", ")} for ${booking.name}.`);
    setName("");
    setPicked([]);
  };

  return (
    <div className="as">
      <a className="as-skip" href="#main">Skip to content</a>
      <AppTop name="Box Office" tagline="Seat map demo" />

      <main id="main" className="tb-page">
        <div className="as-head">
          <div>
            <h1>Pick your place.</h1>
            <p>Choose open seats, leave a name, and keep the booking in this browser. No payment or remote reservation is connected.</p>
          </div>
        </div>

        <section className="as-composer tb-map" aria-labelledby="map-title">
          <div className="tb-map-head">
            <h2 id="map-title">The simple seat map</h2>
            <p aria-live="polite">{available} seats open · {selected.length} selected</p>
          </div>
          <ul className="tb-legend" aria-label="Legend">
            <li><span className="tb-key" data-state="open" aria-hidden="true" />Open</li>
            <li><span className="tb-key" data-state="selected" aria-hidden="true" />Selected</li>
            <li><span className="tb-key" data-state="taken" aria-hidden="true" />Unavailable (struck through)</li>
          </ul>
          <p className="tb-stage" aria-hidden="true">Stage</p>
          <div className="tb-rows">
            {ROWS.map((row) => (
              <div className="tb-row" key={row} role="group" aria-label={`Row ${row}`}>
                <span className="tb-row-label" aria-hidden="true">{row}</span>
                <div className="tb-seats">
                  {seatsInRow(seats, row).map((seat) => (
                    <button
                      key={seat.id}
                      type="button"
                      className="tb-seat"
                      data-state={seat.taken ? "taken" : selected.includes(seat.id) ? "selected" : "open"}
                      disabled={seat.taken}
                      aria-label={seat.taken ? `Seat ${seat.id}, unavailable` : `Seat ${seat.id}`}
                      aria-pressed={seat.taken ? undefined : selected.includes(seat.id)}
                      onClick={() => toggle(seat.id)}
                    >
                      {seat.id.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Phones: a jump bar in the page flow right after the map (never floating, so it cannot cover a seat). */}
        {selected.length ? (
          <div className="tb-sticky">
            <span>{selected.length} {selected.length === 1 ? "seat" : "seats"} selected</span>
            <a className="as-button" href="#reserve">Review and reserve</a>
          </div>
        ) : null}

        <form id="reserve" className="as-composer tb-form" onSubmit={book} aria-labelledby="reserve-title">
          <h2 id="reserve-title">Your reservation</h2>
          <label className="as-field">Name
            <input value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} placeholder="Your name" aria-describedby="reserve-help" />
          </label>
          <p className="tb-seats-chosen"><span>Seats</span><strong>{selected.length ? selected.join(" · ") : "None yet — choose on the map"}</strong></p>
          <div className="as-composer-foot">
            <p id="reserve-help" className="tb-help" aria-live="polite">{missing.length ? `To reserve, ${missing.join(" and ")}.` : "Ready to reserve."}</p>
            <button className="as-button" type="submit" disabled={missing.length > 0}>Reserve {selected.length > 1 ? `${selected.length} seats` : "seat"}</button>
          </div>
        </form>


        <section className="tb-history" aria-labelledby="history-title">
          <h2 id="history-title" className="tb-title">Bookings in this browser</h2>
          {bookings.length ? (
            <ul className="as-list">
              {bookings.slice(0, 4).map((booking) => (
                <li className="as-row" key={`${booking.at}-${booking.name}`}>
                  <div>
                    <h3>{booking.name}</h3>
                    <p>Seats {booking.seats.join(", ")}</p>
                  </div>
                  <span className="tb-stub-date"><time dateTime={new Date(booking.at).toISOString()}>{stubDate.format(booking.at)}</time></span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="as-list as-empty"><strong>No bookings yet</strong>Choose seats and reserve them; the stub shows up here.</div>
          )}
        </section>

        <p className="as-note">A seat-map interaction demo. Bookings stay in this browser; nothing is paid, sent or held anywhere else.</p>
      </main>

      <p className="as-sr" role="status" aria-live="polite">{announcement}</p>
      <AppFoot source="https://github.com/bookchaowalit-website/commerce-ticket-booking-web" />
    </div>
  );
}
