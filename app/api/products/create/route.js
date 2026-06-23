import { NextResponse } from "next/server";

// Simulates POST /product/202309/products/create.
// In production this call originates from the merchant's catalog
// (here: a Shopify dev store) and pushes a normalized product
// payload into TikTok Shop's catalog.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  await new Promise((resolve) => setTimeout(resolve, 650));

  return NextResponse.json({
    product_id: `tts_prod_${Math.random().toString(36).slice(2, 10)}`,
    title: body.name || "Demo Product",
    price: body.price || "0.00",
    status: "ACTIVE",
    source_platform: "shopify",
    review_status: "APPROVED",
  });
}
