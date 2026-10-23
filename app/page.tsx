"use client";

import { useState, useSyncExternalStore } from "react";
import { ROWS, bookingStore, countAvailable, createBooking, seatsInRow, seatsWithBookings, toggleSeat } from "@/lib/ticket-booking";

export default function Home() {
  const bookings = useSyncExternalStore(bookingStore.subscribe, bookingStore.getSnapshot, bookingStore.getServerSnapshot);
  const seats = seatsWithBookings(bookings);
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const selected = picked.filter((id) => seats.some((seat) => seat.id === id && !seat.taken));
  const available = countAvailable(seats);
  const toggle = (id: string) => setPicked((current) => toggleSeat(current, id));
  const book = () => {
    const booking = createBooking(seats, name, selected);
    if (!booking) return;
    bookingStore.update((current) => [booking, ...current]);
    setName(""); setPicked([]);
  };

  return (
    <main className="box-office">
      <header className="office-header">
        <div className="ticket-mark">B<span>✦</span>O</div>
        <div className="office-name"><span>BOOKCHAOWALIT PRESENTS</span><strong>SEAT MAP / 001</strong></div>
        <div className="office-line" /><span className="office-state">LOCAL BOOKING DEMO</span>
      </header>
      <section className="showbill">
        <div><p className="ticket-label">ONE SCREEN / FOUR ROWS</p><h1>Pick your<br /><em>place.</em></h1></div>
        <div className="show-details"><span>SHOW 01</span><strong>THE SIMPLE SEAT MAP</strong><p>Choose open seats, leave a name, and keep the booking in this browser.</p></div>
      </section>
      <section className="booking-window" aria-label="Seat booking">
        <div className="seat-side">
          <div className="stage-label"><span>STAGE</span><i /></div>
          <div className="seat-legend"><span><i className="legend-open" /> open</span><span><i className="legend-selected" /> selected</span><span><i className="legend-taken" /> unavailable</span></div>
          <div className="seat-map">
            {ROWS.map((row) => <div className="seat-row" key={row}><span className="row-label">{row}</span>{seatsInRow(seats, row).map((seat) => <button key={seat.id} className={seat.taken ? "seat taken" : selected.includes(seat.id) ? "seat selected" : "seat"} disabled={seat.taken} aria-label={seat.taken ? `${seat.id} unavailable` : `Select seat ${seat.id}`} aria-pressed={selected.includes(seat.id)} onClick={() => toggle(seat.id)}>{seat.id.slice(1)}</button>)}</div>)}
          </div>
          <div className="availability-line"><span>{available} seats remain</span><span>{selected.length} selected</span></div>
        </div>
        <aside className="ticket-window">
          <p className="ticket-label">BOX OFFICE WINDOW</p><h2>Your<br /><em>reservation.</em></h2>
          <p className="window-note">No payment or remote reservation is connected. This is a seat-map interaction demo.</p>
          <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
          <div className="selection-receipt"><span>SEATS</span><strong>{selected.length ? selected.join(" · ") : "Choose on the map"}</strong></div>
          <button className="reserve-button" disabled={!name.trim() || selected.length === 0} onClick={book}>Reserve seats <span>→</span></button>
        </aside>
      </section>
      <section className="booking-history">
        <div><p className="ticket-label">LOCAL STUBS</p><h2>Recent bookings</h2></div>
        {bookings.length === 0 ? <p className="no-bookings">Your browser has no booking stubs yet.</p> : <div className="stub-list">{bookings.slice(0, 4).map((booking) => <div className="stub" key={`${booking.at}-${booking.name}`}><span>{new Date(booking.at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span><strong>{booking.name}</strong><b>{booking.seats.join(" · ")}</b></div>)}</div>}
      </section>
      <footer className="office-footer"><span>BOOKCHAOWALIT / TICKET BOOKING</span><span>LOCAL BROWSER STATE · DEMO-GRADE</span></footer>
    </main>
  );
}
