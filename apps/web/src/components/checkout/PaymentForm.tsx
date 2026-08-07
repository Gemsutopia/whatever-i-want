'use client';

import { IconBrandPaypal, IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import { store } from '@/lib/store';

export interface CheckoutCustomerData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutCartItem {
  id: string;
  variantId?: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
  sku?: string;
}

/**
 * QuickDash returns the whole order row; its typed surface covers the common
 * columns and leaves the rest as `unknown`. Tax, shipping and discount are read
 * through here rather than with a cast at each site.
 */
const readCents = (order: Record<string, unknown>, key: string): number =>
  typeof order[key] === 'number' ? (order[key] as number) : 0;

/** What the confirmation screen reads after the shopper returns from PayPal. */
export interface StoredCheckout {
  orderId: string;
  orderNumber: string;
  externalPaymentId: string;
  provider: string;
  receipt: {
    currency: string;
    subtotalCents: number;
    totalCents: number;
    shippingCents: number;
    discountCents: number;
    taxCents: number;
    lines: Array<{ id: string; name: string; quantity: number; unitPriceCents: number }>;
  };
  customerData: CheckoutCustomerData;
}

interface PaymentFormProps {
  paymentMethod: 'paypal';
  /** Display total, in the currency the shopper is browsing in. */
  amount: number;
  currency: string;
  customerData: CheckoutCustomerData;
  items: CheckoutCartItem[];
  /** The catalog-currency total this page showed, in cents. See below. */
  expectedTotalCents: number;
  /** A discount code the shopper entered and QuickDash confirmed. */
  discountCode: string | null;
  /** A referral code carried in from a share link. Never changes the price. */
  referralCode: string | null;
  /** The id of a delivery rate QuickDash itself offered. */
  shippingRateId: string;
  countryCode: string;
  onError: (error: string) => void;
}

export default function PaymentForm({
  amount,
  currency,
  customerData,
  items,
  expectedTotalCents,
  discountCode,
  referralCode,
  shippingRateId,
  countryCode,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      /**
       * One call creates the order AND opens its payment.
       *
       * 🔴 The idempotency key is generated once per attempt and sent with the
       * request. A double-tapped button, or a retry after a dropped connection,
       * returns the SAME order instead of making a second one — which is the
       * difference between a slow network and being charged twice.
       */
      const idempotencyKey = crypto.randomUUID();
      const { order, payment, paymentUnavailableReason } = await store.checkout.create(
        {
          items: items.map((item) => ({
            catalogItemId: item.id,
            ...(item.variantId ? { variantId: item.variantId } : {}),
            quantity: item.quantity,
          })),
          email: customerData.email,
          name: `${customerData.firstName} ${customerData.lastName}`.trim(),
          ...(discountCode ? { discountCode } : {}),
          ...(referralCode ? { referralCode } : {}),
          shippingRateId,
          shippingAddress: {
            name: `${customerData.firstName} ${customerData.lastName}`.trim(),
            line1: customerData.address,
            line2: customerData.apartment || null,
            city: customerData.city,
            region: customerData.state,
            postalCode: customerData.zipCode,
            countryCode,
          },
        },
        idempotencyKey
      );

      if (!payment) {
        throw new Error(
          paymentUnavailableReason ??
            'This store cannot take payments right now. Your order was not placed.'
        );
      }

      /**
       * 🔴 The one check that has to happen on this side.
       *
       * QuickDash prices from the catalog, never from the page, which is exactly
       * what stops a tampered basket. The flip side is that a price edited while
       * this tab sat open produces a REAL total higher than the one the shopper
       * read. Sending them to PayPal for a number they never agreed to would be
       * the same wrong in the other direction, so the mismatch stops here and the
       * unpaid order is simply left behind.
       */
      if (order.totalCents !== expectedTotalCents) {
        throw new Error(
          'Prices changed while you were checking out. Return to your cart to review the new total before paying.'
        );
      }

      if (payment.nextAction.type !== 'approval') {
        throw new Error('This store’s payment provider is not supported by this checkout yet.');
      }

      /**
       * What the return trip needs, taken from QUICKDASH'S order — not the page.
       *
       * The prototype stashed the browser's own items, prices and totals here and
       * then built the order out of them afterwards, so whatever sessionStorage
       * said became the sale. Here the order already exists server-side and
       * settlement is keyed on `externalPaymentId`; these figures are a receipt
       * snapshot for rendering, copied off the authoritative response.
       *
       * A guest has no customer session, so `/customer/orders/:id` is correctly
       * closed to them on return — this snapshot is what the confirmation screen
       * reads instead.
       */
      sessionStorage.setItem(
        'quickdashCheckout',
        JSON.stringify({
          orderId: order.id,
          orderNumber: order.number,
          externalPaymentId: payment.externalPaymentId,
          provider: payment.provider,
          receipt: {
            currency: order.currency,
            subtotalCents: order.subtotalCents,
            totalCents: order.totalCents,
            shippingCents: readCents(order, 'shippingCents'),
            discountCents: readCents(order, 'discountCents'),
            taxCents: readCents(order, 'taxCents'),
            lines: (order.lineItems ?? []).map((line) => ({
              id: line.id,
              name: line.name,
              quantity: line.quantity,
              unitPriceCents: line.unitPriceCents,
            })),
          },
          customerData,
        })
      );

      window.location.href = payment.nextAction.approvalUrl;
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Unable to start PayPal checkout. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <IconBrandPaypal size={26} className="text-white" />
        <h2 className="text-lg font-semibold text-white">Pay with PayPal</h2>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <IconLock size={18} className="mt-0.5 shrink-0 text-white/60" />
          <p className="text-sm leading-6 text-white/60">
            You&apos;ll be redirected to PayPal to securely complete your payment, then returned
            here for confirmation.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-white/60">Total amount</span>
        <span className="text-lg font-semibold text-white">
          ${amount.toFixed(2)} {currency}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            Redirecting to PayPal...
          </span>
        ) : (
          'Continue to PayPal'
        )}
      </button>
    </div>
  );
}
