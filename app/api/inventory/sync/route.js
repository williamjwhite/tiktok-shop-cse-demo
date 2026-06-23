import { NextResponse } from "next/server";

// Simulates POST /product/202309/products/{product_id}/inventory/update.
// Keeps TikTok Shop's available_quantity aligned with the source-of-truth
// inventory count from the merchant's OMS/WMS (here: Shopify).
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  await new Promise((resolve) => setTimeout(resolve, 550));

  return NextResponse.json({
    product_id: body.product_id,
    sku_id: `sku_${Math.random().toString(36).slice(2, 8)}`,
    available_quantity: body.quantity ?? 24,
    synced: true,
    sync_source: "shopify_admin_api",
  });
}
