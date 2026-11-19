// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("labels the button for several seats", () => {
    press(seat("C1"));
    press(seat("C2"));
    expect($("#reserve .as-button")!.textContent).toBe("Reserve 2 seats");
  });
});
