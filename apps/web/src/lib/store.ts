/**
 * Store instance for gemsutopia
 *
 * This connects to the Quickdash backend.
 * Replace the apiKey with your actual storefront API key from:
 * Quickdash Admin > Settings > Storefronts
 */

import { StorefrontClient } from './storefront-client';

const storefrontApiKey = process.env.NEXT_PUBLIC_QUICKDASH_SITE_KEY;
const workspaceId = process.env.NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID;

if (!storefrontApiKey) {
  throw new Error('Missing NEXT_PUBLIC_QUICKDASH_SITE_KEY');
}
if (!workspaceId) {
  throw new Error('Missing NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID');
}

// Create the store instance
export const store = new StorefrontClient({
  apiKey: storefrontApiKey,
  workspaceId,
  baseUrl: process.env.NEXT_PUBLIC_QUICKDASH_API_URL || 'https://api.quickdash.xyz',
});

// Re-export types for convenience
export type {
  Address,
  Auction,
  Category,
  ConversationMessage,
  Customer,
  CustomerConversation,
  FaqItem,
  Order,
  Product,
  Review,
  ShippingRate,
  SiteContentItem,
  SiteSettings,
  StatItem,
  Testimonial,
  WishlistItem,
} from './storefront-client';

// ============================================
// How a storefront uses this
// ============================================

/*
// ── Catalog ──────────────────────────────────────────────────────────────────
const { products, pagination } = await store.products.list({ category: 'gemstones', limit: 20 })
const { product } = await store.products.get('blue-sapphire')

// ── Identity ─────────────────────────────────────────────────────────────────
// Passwordless. There is no password to take, store, leak or reset.
await store.auth.requestSignInLink('customer@example.com', `${origin}/auth/verify`)
// …the emailed link lands on /auth/verify with ?token=
const { token } = await store.auth.verifySignInLink(tokenFromUrl)
store.setCustomerToken(token)

// ── Buying ───────────────────────────────────────────────────────────────────
// 1. Ask what a code is worth. The CART goes up, never a subtotal.
const preview = await store.discounts.preview({ code: 'SAVE10', items })
// 2. Ask what delivery costs. Every option comes back with a rateId.
const quote = await store.shipping.quote({ items, destination })
// 3. Create the order and open its payment, in one authoritative call.
//    Send codes and ids only — never a price, total, tax or currency.
const { order, payment } = await store.checkout.create(
  { items, email, discountCode: 'SAVE10', shippingRateId: quote.options[0].rateId, shippingAddress },
  idempotencyKey,
)
if (payment?.nextAction.type === 'approval') window.location.href = payment.nextAction.approvalUrl
// 4. On return, settle it. Safe to call twice.
await store.checkout.capture(payment.externalPaymentId)

// ── After the sale ───────────────────────────────────────────────────────────
const { orders } = await store.orders.list()          // the session decides whose
const { conversation } = await store.messages.start('Where is my order?', 'Hi…')
*/
