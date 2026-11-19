// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let host: HTMLDivElement;
const $ = <T extends Element = HTMLElement>(selector: string) => host.querySelector(selector) as T | null;
const seat = (id: string) => $<HTMLButtonElement>(`[aria-label^='Seat ${id}']`)!;
const press = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
function type(el: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const submit = () => act(() => { $("#reserve")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });

beforeEach(() => {
  localStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Home />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("booking", () => {
  it("selects seats, explains what is missing, reserves and lists the stub", () => {
    press(seat("B2"));
    press(seat("B3"));
    expect(seat("B2").getAttribute("aria-pressed")).toBe("true");
    expect($(".tb-sticky")!.textContent).toContain("2 seats selected");
    expect($(".tb-help")!.textContent).toBe("To reserve, enter a name.");
    press(seat("B3"));
    expect($(".tb-sticky")!.textContent).toContain("1 seat selected");
    submit(); // no name yet: nothing happens
    expect($(".as-empty")).not.toBeNull();
    type($<HTMLInputElement>("#reserve input")!, "Mina");
    expect($(".tb-help")!.textContent).toBe("Ready to reserve.");
    submit();
    expect($(".tb-history")!.textContent).toContain("Mina");
    expect($(".tb-history")!.textContent).toContain("Seats B2");
    expect(seat("B2").disabled).toBe(true);
    expect($("[role='status']")!.textContent).toBe("Reserved B2 for Mina.");
    expect($(".tb-sticky")).toBeNull();
    expect(JSON.parse(localStorage.getItem("ticket-booking-v2")!)[0]).toMatchObject({ name: "Mina", seats: ["B2"] });
  });

  it("puts the phone jump bar before the form, so once the form is in view the bar cannot cover Reserve", () => {
    press(seat("C1"));
    const bar = $(".tb-sticky")!;
    const form = $("#reserve")!;
    expect(bar.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bar.querySelector("a")!.getAttribute("href")).toBe("#reserve");
  });

  it("still renders the page and the good stubs when a saved stub has an impossible date", () => {
    act(() => root.unmount());
    localStorage.setItem("ticket-booking-v2", JSON.stringify([{ name: "Broken", seats: ["A2"], at: 9e15 }, { name: "Mina", seats: ["B2"], at: 1_700_000_000_000 }]));
    root = createRoot(host);
    act(() => root.render(<Home />));
    expect($(".tb-history")!.textContent).toContain("Mina");
    expect($(".tb-history")!.textContent).not.toContain("Broken");
    expect($(".tb-history time")!.getAttribute("dateTime")).toBe(new Date(1_700_000_000_000).toISOString());
    expect(seat("B2").disabled).toBe(true);
    expect(seat("A2").disabled).toBe(false);
  });

  it("labels the button for several seats", () => {
    press(seat("C1"));
    press(seat("C2"));
    expect($("#reserve .as-button")!.textContent).toBe("Reserve 2 seats");
  });
});

describe("phone jump bar", () => {
  it("a seat focused under the floating bar scrolls up clear of it, focus ring included", () => {
    const open = [...host.querySelectorAll<HTMLButtonElement>(".tb-seat:not(:disabled)")];
    press(open[0]);
    const bar = $<HTMLDivElement>(".tb-sticky")!;
    bar.style.position = "sticky";
    const rect = (top: number, height: number) => ({ top, bottom: top + height, left: 0, right: 0, width: 0, height, x: 0, y: top, toJSON() {} }) as DOMRect;
    vi.spyOn(bar, "getBoundingClientRect").mockReturnValue(rect(600, 60));
    const under = open[open.length - 1];
    vi.spyOn(under, "getBoundingClientRect").mockReturnValue(rect(610, 44));
    const scrollBy = vi.fn();
    vi.stubGlobal("scrollBy", scrollBy);
    try {
      act(() => { under.focus(); });
      expect(scrollBy).toHaveBeenCalledWith({ top: 62 }); // 610 + 44 + 8 - 600
      scrollBy.mockClear();
      const clear = open[1];
      vi.spyOn(clear, "getBoundingClientRect").mockReturnValue(rect(300, 44));
      act(() => { clear.focus(); });
      expect(scrollBy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  });
});
