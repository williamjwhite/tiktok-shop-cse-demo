"use client";

import { useEffect, useRef, useState } from "react";

const PRODUCT = {
  name: "Aurora Pour-Over Kettle",
  price: "34.99",
  description:
    "Gooseneck stainless kettle with a 0.9L capacity, built for slow, even pours. Demo SKU for the integration walkthrough.",
  sku: "AUR-KTL-BLK",
};

function timestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function Page() {
  const [log, setLog] = useState([]);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [productId, setProductId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [synced, setSynced] = useState(false);
  const [fulfilled, setFulfilled] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState(null);
  const [showUnbox, setShowUnbox] = useState(false);

  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [log]);

  function pushLog(entry) {
    setLog((prev) => [
      ...prev,
      { id: prev.length, time: timestamp(), ...entry },
    ]);
  }

  async function callApi(path, payload) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error(`${path} failed`);
    return res.json();
  }

  async function handleConnect() {
    setBusy(true);
    pushLog({
      status: "pending",
      text: "POST /api/auth/tiktok",
      detail: "Requesting OAuth2 access token from TikTok Shop…",
    });
    try {
      const data = await callApi("/api/auth/tiktok");
      setConnected(true);
      pushLog({
        status: "success",
        text: "Authorization granted",
        detail: `shop_id=${data.shop_id} · scopes: ${data.scope.join(", ")}`,
      });
    } catch (e) {
      pushLog({ status: "info", text: "Authorization failed", detail: String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function handleSendToShop() {
    setBusy(true);
    try {
      pushLog({
        status: "pending",
        text: "POST /api/products/create",
        detail: `Pushing "${PRODUCT.name}" from Shopify catalog…`,
      });
      const product = await callApi("/api/products/create", {
        name: PRODUCT.name,
        price: PRODUCT.price,
      });
      setProductId(product.product_id);
      pushLog({
        status: "success",
        text: "Product created on TikTok Shop",
        detail: `product_id=${product.product_id} · status=${product.status}`,
      });

      pushLog({
        status: "pending",
        text: "POST /api/inventory/sync",
        detail: "Syncing available quantity from source-of-truth inventory…",
      });
      const inventory = await callApi("/api/inventory/sync", {
        product_id: product.product_id,
        quantity: 24,
      });
      pushLog({
        status: "success",
        text: "Inventory synced",
        detail: `sku_id=${inventory.sku_id} · available_quantity=${inventory.available_quantity}`,
      });

      pushLog({
        status: "pending",
        text: "POST /api/affiliate/create",
        detail: "Registering open affiliate offer for creators…",
      });
      const affiliate = await callApi("/api/affiliate/create", {
        product_id: product.product_id,
      });
      setAffiliateLink(affiliate.shareable_link);
      pushLog({
        status: "success",
        text: "Affiliate offer live",
        detail: `commission=${affiliate.commission_rate} · offer_id=${affiliate.offer_id}`,
      });

      setSynced(true);
    } catch (e) {
      pushLog({ status: "info", text: "Sync step failed", detail: String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function handleSimulateOrder() {
    setBusy(true);
    try {
      pushLog({
        status: "pending",
        text: "Incoming webhook · ORDER_STATUS_CHANGE",
        detail: "TikTok Shop notifies app of a new order…",
      });
      const order = await callApi("/api/orders/webhook", {
        product_id: productId,
        buyer_message: "Excited to try this — saw it on a creator's unboxing!",
      });
      setOrderId(order.order_id);
      pushLog({
        status: "success",
        text: "Webhook received",
        detail: `order_id=${order.order_id} · status=${order.order_status}`,
      });

      pushLog({
        status: "pending",
        text: "POST /api/shipstation/mock",
        detail: "Handing order to fulfillment for label creation…",
      });
      const label = await callApi("/api/shipstation/mock", {
        order_id: order.order_id,
      });
      pushLog({
        status: "success",
        text: "Fulfillment label created",
        detail: `${label.carrier} ${label.service} · tracking=${label.tracking_number}`,
      });

      setFulfilled(true);
    } catch (e) {
      pushLog({ status: "info", text: "Fulfillment step failed", detail: String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="eyebrow">Merchant Integration Walkthrough</div>
          <h1>TikTok Shop · Unboxing to Fulfillment</h1>
        </div>
        <div className="conn-pill">
          <span className={`dot ${connected ? "live" : ""}`} />
          {connected ? "Connected to TikTok Shop" : "Not connected"}
        </div>
      </header>

      <div className="grid">
        {/* Product card — simulates the merchant's catalog (Shopify) */}
        <div className="panel">
          <div className="panel-header">
            <h2>Product Catalog</h2>
            <span className="tag">shopify · dev store</span>
          </div>
          <div className="panel-body product-card">
            <div className="product-image">
              <span className="badge">SKU {PRODUCT.sku}</span>
              <span className="box-icon">📦</span>
            </div>
            <h3>{PRODUCT.name}</h3>
            <div className="price">${PRODUCT.price}</div>
            <p className="desc">{PRODUCT.description}</p>

            <div className="meta-row">
              <span>tiktok_product_id</span>
              <span>{productId || "—"}</span>
            </div>
            <div className="meta-row">
              <span>affiliate_link</span>
              <span>{affiliateLink ? "active" : "—"}</span>
            </div>
            <div className="meta-row">
              <span>last_order_id</span>
              <span>{orderId || "—"}</span>
            </div>

            <div className="actions">
              <button
                className="btn"
                onClick={() => setShowUnbox(true)}
                disabled={busy}
              >
                🎬 Watch Unboxing
              </button>
              <button
                className="btn primary"
                onClick={handleConnect}
                disabled={connected || busy}
              >
                {connected ? "✓ Connected" : "Connect TikTok Shop Account"}
              </button>
              <button
                className="btn"
                onClick={handleSendToShop}
                disabled={!connected || synced || busy}
              >
                Send to TikTok Shop
              </button>
              <button
                className="btn"
                onClick={handleSimulateOrder}
                disabled={!synced || busy}
              >
                Simulate Customer Order
              </button>
            </div>

            {affiliateLink && (
              <div className="link-callout">{affiliateLink}</div>
            )}
          </div>
        </div>

        {/* Console — the integration log */}
        <div className="panel">
          <div className="panel-header">
            <h2>Integration Console</h2>
            <span className="tag">live request log</span>
          </div>
          <div className="console" ref={consoleRef}>
            {log.length === 0 && (
              <div className="console-empty mono">
                Waiting for the first action — connect the account to begin.
                <span className="cursor" />
              </div>
            )}
            {log.map((entry) => (
              <div className="log-line" key={entry.id}>
                <span className="time">{entry.time}</span>
                <span className={`status ${entry.status}`}>
                  {entry.status === "success"
                    ? "OK"
                    : entry.status === "pending"
                    ? "RUN"
                    : "ERR"}
                </span>
                <span className="text">
                  {entry.text}
                  {entry.detail && (
                    <span className="detail">{entry.detail}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="console-footer">
            <span>{fulfilled ? "Flow complete" : "Flow in progress"}</span>
            <span>{log.length} events logged</span>
          </div>
        </div>
      </div>

      <p className="footnote">
        All requests in this demo hit local mock API routes — no real TikTok
        Shop, Shopify, or ShipStation credentials are used.
      </p>

      {showUnbox && (
        <div className="modal-overlay" onClick={() => setShowUnbox(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Unboxing — {PRODUCT.name}</h3>
            <div className="modal-video">
              ▶ Placeholder for a 10–15s CapCut export
              <br />
              (swap this block for an actual &lt;video&gt; element)
            </div>
            <button className="btn" onClick={() => setShowUnbox(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
