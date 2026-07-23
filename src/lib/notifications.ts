/**
 * notifications.ts — Notification Service (scaffold)
 *
 * A clean, provider-agnostic notification layer so future order-status
 * notifications (e.g. WhatsApp Business API) can be connected without touching
 * call sites. It is DISABLED by default and safely no-ops until credentials are
 * configured, so wiring it into order flows now has zero runtime impact.
 *
 * ── How to enable WhatsApp later ────────────────────────────────────────────
 *   1. Add credentials to .env:
 *        WHATSAPP_ENABLED=true
 *        WHATSAPP_PHONE_NUMBER_ID=...
 *        WHATSAPP_ACCESS_TOKEN=...
 *   2. Implement the TODO in `WhatsAppProvider.send()` (Graph API call).
 *   Nothing else needs to change — call sites already invoke `notify*`.
 */

import type { Order, OrderStatus } from "@/types";

export type NotificationChannel = "whatsapp" | "email" | "sms";

export interface NotificationMessage {
  /** E.164 phone (for whatsapp/sms) or email address. */
  to: string;
  channel: NotificationChannel;
  /** Short template key so providers can map to approved templates. */
  template: string;
  /** Human-readable fallback body. */
  body: string;
  /** Arbitrary template variables. */
  data?: Record<string, unknown>;
}

export interface NotificationResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  providerId?: string;
}

interface NotificationProvider {
  readonly channel: NotificationChannel;
  isEnabled(): boolean;
  send(message: NotificationMessage): Promise<NotificationResult>;
}

// ── WhatsApp provider (disabled placeholder) ─────────────────────────────────
class WhatsAppProvider implements NotificationProvider {
  readonly channel = "whatsapp" as const;

  isEnabled(): boolean {
    return (
      process.env.WHATSAPP_ENABLED === "true" &&
      Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID) &&
      Boolean(process.env.WHATSAPP_ACCESS_TOKEN)
    );
  }

  async send(message: NotificationMessage): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      return { ok: false, skipped: true, reason: "whatsapp_disabled" };
    }
    // TODO(WHATSAPP): Call the WhatsApp Business Cloud API here, e.g.
    //   POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
    //   Authorization: Bearer {ACCESS_TOKEN}
    //   body: { messaging_product: "whatsapp", to: message.to, type: "template", ... }
    // Until implemented we treat it as skipped so nothing breaks.
    void message;
    return { ok: false, skipped: true, reason: "whatsapp_not_implemented" };
  }
}

const providers: Record<NotificationChannel, NotificationProvider> = {
  whatsapp: new WhatsAppProvider(),
  // Email/SMS providers can be added later following the same interface.
  email: {
    channel: "email",
    isEnabled: () => false,
    async send() {
      return { ok: false, skipped: true, reason: "email_disabled" };
    },
  },
  sms: {
    channel: "sms",
    isEnabled: () => false,
    async send() {
      return { ok: false, skipped: true, reason: "sms_disabled" };
    },
  },
};

/** Send a single notification through the given channel. Safe no-op when disabled. */
export async function sendNotification(
  message: NotificationMessage
): Promise<NotificationResult> {
  try {
    const provider = providers[message.channel];
    if (!provider || !provider.isEnabled()) {
      return { ok: false, skipped: true, reason: `${message.channel}_disabled` };
    }
    return await provider.send(message);
  } catch (err) {
    // Notifications must never break the primary flow (order placement etc.).
    console.error("Notification send failed:", err);
    return { ok: false, reason: "provider_error" };
  }
}

// ── High-level helpers (call these from order flows) ─────────────────────────

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Your order {id} has been placed and is pending confirmation.",
  accepted: "Good news! Your order {id} has been accepted.",
  preparing: "Your order {id} is being prepared.",
  packed: "Your order {id} has been packed.",
  shipped: "Your order {id} has shipped. Tracking: {tracking}.",
  out_for_delivery: "Your order {id} is out for delivery.",
  delivered: "Your order {id} has been delivered. Enjoy!",
  cancelled: "Your order {id} has been cancelled.",
  rejected: "Your order {id} could not be accepted.",
  returned: "We received the return for order {id}.",
  refunded: "A refund for order {id} has been processed.",
};

/**
 * Notify a customer about an order status change.
 * Currently disabled (no-op) until a provider is enabled — see file header.
 */
export async function notifyOrderStatus(
  order: Pick<Order, "id" | "customerPhone" | "customerEmail" | "trackingNumber">,
  status: OrderStatus
): Promise<NotificationResult> {
  const body = (STATUS_MESSAGES[status] || "Order {id} updated.")
    .replace("{id}", order.id)
    .replace("{tracking}", order.trackingNumber || "");

  if (!order.customerPhone) {
    return { ok: false, skipped: true, reason: "no_recipient" };
  }

  return sendNotification({
    to: order.customerPhone,
    channel: "whatsapp",
    template: `order_${status}`,
    body,
    data: { orderId: order.id, status },
  });
}

/** Whether any notification channel is currently live. */
export function notificationsEnabled(): boolean {
  return Object.values(providers).some((p) => p.isEnabled());
}
