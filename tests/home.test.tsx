import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

describe("home page on the App shell", () => {
  it("renders the seat map, the reservation form, the demo limits and the hub link", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("Pick your place.");
    expect(html).toMatch(/26(<!-- -->)? seats open/);
    expect(html).toContain("No payment or remote reservation is connected");
    expect(html).toContain("No bookings yet");
    expect(html).toContain('href="https://bookchaowalit.com/"');
  });

  it("announces the whole seat count sentence, not just the changed number", () => {
    const html = renderToString(<Home />);
    expect(html).toMatch(/<p aria-live="polite" aria-atomic="true">26(<!-- -->)? seats open/);
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

});

describe("sitemap and robots origin", () => {
  // lib/site.ts reads NEXT_PUBLIC_SITE_URL at import: set the env first, then load the routes fresh.
  async function routesWith(url: string | undefined) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", url ?? "");
    const [{ default: sitemap }, { default: robots }] = await Promise.all([import("@/app/sitemap"), import("@/app/robots")]);
    return { sitemap, robots };
  }
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to ticket-booking.bookchaowalit.com when NEXT_PUBLIC_SITE_URL is unset", async () => {
    const { sitemap, robots } = await routesWith(undefined);
    expect(sitemap()[0].url).toBe("https://ticket-booking.bookchaowalit.com");
    expect(robots().sitemap).toBe("https://ticket-booking.bookchaowalit.com/sitemap.xml");
  });

  it("uses NEXT_PUBLIC_SITE_URL when set, without a trailing slash", async () => {
    const { sitemap, robots } = await routesWith("https://preview.example.org/");
    expect(sitemap()[0].url).toBe("https://preview.example.org");
    expect(robots().sitemap).toBe("https://preview.example.org/sitemap.xml");
  });
});
