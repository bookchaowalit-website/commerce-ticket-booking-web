import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("home page on the App shell", () => {
  it("renders the seat map, the reservation form, the demo limits and the hub link", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("Pick your place.");
    expect(html).toMatch(/26(<!-- -->)? seats open/);
    expect(html).toContain("No payment or remote reservation is connected");
    expect(html).toContain("No bookings yet");
    expect(html).toContain('href="https://bookchaowalit.com/"');
  });

  it("tells screen readers where the stage is: row A nearest", () => {
    const html = renderToString(<Home />);
    const stage = html.match(/<p class="tb-stage"[^>]*>([\s\S]*?)<\/p>/);
    expect(stage?.[0]).not.toContain("aria-hidden");
    expect(stage?.[1].replace(/<[^>]+>/g, "")).toBe("Stage, row A is nearest and row D farthest");
  });

  it("marks unavailable seats in words and keeps Reserve disabled with a reason", () => {
    const html = renderToString(<Home />);
    expect(html).toContain('aria-label="Seat A1, unavailable"');
    expect(html).toMatch(/<button[^>]*class="as-button"[^>]*disabled/);
    expect(html).toContain("To reserve, enter a name and choose at least one open seat.");
  });

  it("publishes sitemap and robots on ticket-booking.bookchaowalit.com", () => {
    expect(sitemap()[0].url).toBe("https://ticket-booking.bookchaowalit.com");
    expect(robots().sitemap).toBe("https://ticket-booking.bookchaowalit.com/sitemap.xml");
  });
});
