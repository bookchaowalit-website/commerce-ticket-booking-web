import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/mcp/route";

function rpc(body: unknown) {
  return POST(new Request("http://localhost/api/mcp", { method: "POST", body: JSON.stringify(body) }));
}

describe("MCP route", () => {
  it("echoes the JSON-RPC request id", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 7, method: "tools/list" });
    const body = await res.json();
    expect(body.id).toBe(7);
    expect(body.result.tools.map((t: { name: string }) => t.name)).toEqual(["get_seat_map", "get_row"]);
  });

  it("get_seat_map returns the real authored map", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_seat_map" } });
    const { result } = await res.json();
    expect(result.seats).toHaveLength(32);
    expect(result.available).toBe(26);
  });

  it("get_row returns one row and rejects an unknown row", async () => {
    const ok = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_row", arguments: { row: "c" } } })).json();
    expect(ok.result.row).toBe("C");
    expect(ok.result.seats).toHaveLength(8);
    const bad = await (await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_row", arguments: { row: "Q" } } })).json();
    expect(bad.error.code).toBe(-32602);
    expect(bad.id).toBe(3);
  });

  it("rejects an unknown tool instead of pretending to call it", async () => {
    const body = await (await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "book_seats" } })).json();
    expect(body.result).toBeUndefined();
    expect(body.error.code).toBe(-32602);
  });

  it("answers an unknown method and malformed JSON with JSON-RPC errors", async () => {
    expect((await (await rpc({ jsonrpc: "2.0", id: 5, method: "nope" })).json()).error.code).toBe(-32601);
    const res = await POST(new Request("http://localhost/api/mcp", { method: "POST", body: "{" }));
    expect((await res.json()).error.code).toBe(-32700);
  });
});
