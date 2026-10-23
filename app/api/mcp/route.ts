import { NextResponse } from "next/server";
import { INITIAL_SEATS, ROWS, countAvailable, seatsInRow } from "@/lib/ticket-booking";

// Stateless JSON-RPC MCP endpoint over the authored seat map. Bookings live only in each visitor's browser, so the
// server knows the fixed map and nothing else: no tool can book, and no tool reports anyone's bookings.

type RpcRequest = { id?: number | string | null; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };

const TOOLS = [
  { name: "get_seat_map", description: "The fixed seat map with its pre-set unavailable seats (no visitor bookings)", inputSchema: { type: "object", properties: {} } },
  {
    name: "get_row",
    description: "Seats in one row (A-D) of the fixed map",
    inputSchema: { type: "object", properties: { row: { type: "string", enum: [...ROWS] } }, required: ["row"] },
  },
];

class RpcError extends Error {
  constructor(readonly code: number, message: string) {
    super(message);
  }
}

function callTool(name: string | undefined, args: Record<string, unknown> = {}) {
  switch (name) {
    case "get_seat_map":
      return { rows: [...ROWS], seats: INITIAL_SEATS, available: countAvailable(INITIAL_SEATS) };
    case "get_row": {
      const row = typeof args.row === "string" ? args.row.toUpperCase() : "";
      if (!(ROWS as readonly string[]).includes(row)) throw new RpcError(-32602, `No row ${String(args.row)}`);
      const seats = seatsInRow(INITIAL_SEATS, row);
      return { row, seats, available: countAvailable(seats) };
    }
    default:
      throw new RpcError(-32602, `Unknown tool: ${String(name)}`);
  }
}

export async function POST(request: Request) {
  let id: RpcRequest["id"] = null;
  try {
    const body = (await request.json()) as RpcRequest;
    id = body.id ?? null;
    let result: unknown;
    switch (body.method) {
      case "initialize":
        result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "Ticket Booking", version: "1.0.0" } };
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call":
        result = callTool(body.params?.name, body.params?.arguments);
        break;
      default:
        throw new RpcError(-32601, `Unknown method: ${String(body.method)}`);
    }
    return NextResponse.json({ jsonrpc: "2.0", id, result });
  } catch (error) {
    const code = error instanceof RpcError ? error.code : -32700;
    const message = error instanceof RpcError ? error.message : "Parse error";
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 400 });
  }
}
