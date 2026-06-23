import { NextResponse } from "next/server";

// Simulates ShipStation's createLabel call, which a merchant's
// fulfillment service triggers once an order enters AWAITING_SHIPMENT.
// On success, the real flow POSTs tracking info back to TikTok Shop
// via /fulfillment/202309/orders/{order_id}/handover or pkg/ship.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  await new Promise((resolve) => setTimeout(resolve, 700));

  const tracking = Math.floor(1000000000 + Math.random() * 8999999999);

  return NextResponse.json({
    order_id: body.order_id,
    label_id: `ss_label_${Math.random().toString(36).slice(2, 9)}`,
    carrier: "USPS",
    service: "Priority Mail",
    tracking_number: `9400${tracking}US`,
    label_status: "CREATED",
    estimated_delivery_days: 3,
  });
}
