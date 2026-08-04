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
  Customer,
  Discount,
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
// Usage Examples (delete this section later)
// ============================================

/*
// Fetch products
const { products, pagination } = await store.products.list({
  category: 'gemstones',
  limit: 20,
  sort: 'price',
  order: 'asc'
})

// Get single product
const { product } = await store.products.get('blue-sapphire')

// Customer auth
const { user, token } = await store.auth.login({
  email: 'customer@example.com',
  password: 'password123'
})
// Token is automatically stored, or save it to localStorage:
localStorage.setItem('customerToken', token)

// On page load, restore token:
const savedToken = localStorage.getItem('customerToken')
if (savedToken) store.setCustomerToken(savedToken)

// Get customer profile
const { user: profile } = await store.auth.getProfile()

// Wishlist (requires auth)
await store.wishlist.add('product-uuid')
const { wishlist } = await store.wishlist.list()

// Checkout with PayPal
const { approveUrl } = await store.payments.createPayPalOrder({
  items: [
    { name: 'Blue Sapphire', unitAmount: 299.99, quantity: 1 }
  ],
  currency: 'CAD',
  successUrl: `${window.location.origin}/checkout/success`,
  cancelUrl: `${window.location.origin}/cart`,
})
window.location.href = approveUrl

// Validate discount
const { discount } = await store.discounts.validate('SAVE10', 199.99)
console.log(`You save $${discount.discountAmount}`)

// Get shipping rates
const { rates } = await store.shipping.getRates({
  country: 'US',
  state: 'CA',
  subtotal: 299.99
})
*/
