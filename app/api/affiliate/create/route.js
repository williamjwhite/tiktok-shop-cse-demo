import { NextResponse } from "next/server";

// Simulates registering an open/targeted affiliate commission offer
// via TikTok Shop's Affiliate API, then generating the shareable
// product link creators use to drive sales.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  await new Promise((resolve) => setTimeout(resolve, 600));

  const slug = Math.random().toString(36).slice(2, 9);

  return NextResponse.json({
    product_id: body.product_id,
    offer_id: `aff_${Math.random().toString(36).slice(2, 10)}`,
    commission_rate: "15%",
    offer_type: "OPEN_COLLABORATION",
    shareable_link: `https://shop.tiktok.com/view/product/${slug}`,
  });
}
