import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("home page", () => {
  it("renders the seat map, the box office window and the demo limits notice", () => {
    const html = renderToString(<Home />);
    expect(html).toContain("Pick your");
    expect(html).toMatch(/26(<!-- -->)? seats remain/);
    expect(html).toContain("No payment or remote reservation is connected");
    expect(html).toContain("LOCAL BOOKING DEMO");
    expect(html).toContain("Your browser has no booking stubs yet.");
  });

  it("disables unavailable seats and the reserve button until a name and seat are chosen", () => {
    const html = renderToString(<Home />);
    expect(html).toMatch(/aria-label="A1 unavailable"/);
    expect(html).toMatch(/<button[^>]*class="reserve-button"[^>]*disabled/);
  });
});
