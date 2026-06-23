import { NextResponse } from "next/server";

// Simulates the endpoint TikTok Shop calls when a customer places an
// order (event type 1 — ORDER_STATUS_CHANGE → AWAITING_SHIPMENT).
// A real handler would verify the webhook signature, then enqueue a
// fulfillment job. Here we just acknowledge receipt; the demo UI
// triggers the ShipStation mock as the next explicit step.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    received: true,
    order_id: `tts_order_${Math.random().toString(36).slice(2, 10)}`,
    product_id: body.product_id,
    order_status: "AWAITING_SHIPMENT",
    buyer_message: body.buyer_message || "Please ship ASAP, gift wrap not needed.",
  });
}
