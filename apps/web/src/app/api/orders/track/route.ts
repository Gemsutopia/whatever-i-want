import { ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * Guest order tracking, deliberately withdrawn.
 *
 * 🔴 The prototype answered this from `/api/storefront/orders/track` on an order
 * number and an email — two values a stranger can guess or read off a forwarded
 * receipt. Order numbers are sequential, so it enumerated the shop's orders and
 * leaked each one's delivery address.
 *
 * QuickDash has no unauthenticated order endpoint on purpose. The canonical way
 * to see an order is to sign in with the emailed link, which proves the address
 * rather than merely quoting it, and then read `/orders`. That is one extra
 * click and it is the whole difference between "your order" and "an order".
 *
 * Tracked in TECH_DEBT: if guest tracking is wanted back, it needs a signed,
 * expiring, per-order link emailed at dispatch — not a lookup form.
 */
export async function GET() {
  return ApiError.forbidden(
    'Sign in with the link we email you to see your order and its tracking.'
  );
}
