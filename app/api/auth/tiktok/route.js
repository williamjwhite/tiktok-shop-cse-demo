import { NextResponse } from "next/server";

// Simulates the OAuth2 handshake a merchant app performs against
// TikTok Shop's /authorization/202309/products endpoint family.
// In a real integration this would redirect to TikTok's auth screen
// and exchange a code for an access token server-side.
export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    access_token: `ttx_${Math.random().toString(36).slice(2, 12)}`,
    shop_id: `shop_${Math.floor(100000 + Math.random() * 899999)}`,
    shop_name: "Demo Merchant Co.",
    scope: ["product.read", "product.write", "order.read", "fulfillment.write"],
    expires_in: 86400,
  });
}
