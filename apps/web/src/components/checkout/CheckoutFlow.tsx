'use client';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PaymentError from '@/components/error-states/PaymentError';
import { PageLoader } from '@/components/ui/page-loader';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useInventory } from '@/contexts/InventoryContext';
import { clearStoredReferralCode, getStoredReferralCode } from '@/hooks/useReferralTracking';
import { store } from '@/lib/store';
import CartReview from './CartReview';
import CustomerInfo from './CustomerInfo';
import OrderSuccess from './OrderSuccess';
import PaymentForm, { type StoredCheckout } from './PaymentForm';
import PaymentMethods from './PaymentMethods';

type CheckoutCurrency = 'CAD' | 'USD';

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

function convertCheckoutAmount(
  amount: number,
  fromCurrency: CheckoutCurrency,
  toCurrency: CheckoutCurrency,
  cadToUsdRate: number
) {
  if (fromCurrency === toCurrency) return roundMoney(amount);
  if (fromCurrency === 'CAD' && toCurrency === 'USD') return roundMoney(amount * cadToUsdRate);
  return roundMoney(amount / cadToUsdRate);
}

function getShippingCountryCode(country: string) {
  const normalized = country.toLowerCase().trim();
  if (normalized === 'canada' || normalized === 'ca' || normalized === 'can') return 'CA';
  if (
    normalized === 'united states' ||
    normalized === 'usa' ||
    normalized === 'us' ||
    normalized === 'united states of america'
  ) {
    return 'US';
  }
  return country;
}

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown checkout error';
}

interface CheckoutData {
  customer: {
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
  };
  paymentMethod: 'paypal' | null;
  orderTotal: number;
}

type CheckoutStep = 'cart' | 'customer' | 'payment-method' | 'payment' | 'success' | 'error';
type CheckoutErrorAction = 'payment' | 'cart' | 'return' | 'support';

export default function CheckoutFlow() {
  const router = useRouter();
  const { items, clearPouch } = useGemPouch();
  const { convertPrice, currency: currentCurrency, exchangeRate } = useCurrency();
  const { refreshShopProducts, refreshProduct } = useInventory();

  // Preserve items and subtotal for OrderSuccess (before clearPouch)
  const [preservedItems, setPreservedItems] = useState(items);
  const [preservedSubtotal, setPreservedSubtotal] = useState(0);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false);
  const [errorAction, setErrorAction] = useState<CheckoutErrorAction>('payment');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customer: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Canada',
      phone: '',
    },
    paymentMethod: null,
    orderTotal: 0,
  });

  // Load saved customer data and shipping settings on mount
  useEffect(() => {
    const savedCustomerData = localStorage.getItem('customerShippingInfo');
    if (savedCustomerData) {
      try {
        const parsed = JSON.parse(savedCustomerData);
        setCheckoutData((prev) => ({
          ...prev,
          customer: parsed,
        }));
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, []);

  /**
   * A referral code carried in from a share link.
   *
   * ⚠️ It is NOT pre-filled into the discount box any more. QuickDash keeps the
   * two apart on purpose: a discount changes what this order costs, a referral
   * records who brought this customer and pays the referrer once the order
   * settles. Merging them into one field made a referral look like money off,
   * and meant a shopper who cleared the box silently lost the referrer's credit.
   */
  const [referralCode, setReferralCode] = useState<string | null>(null);
  useEffect(() => {
    setReferralCode(getStoredReferralCode() || null);
  }, []);

  // Handle return from PayPal.
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentMethod = urlParams.get('payment_method');
      const status = urlParams.get('status');

      if (!paymentMethod) return;
      if (paymentMethod !== 'paypal') {
        window.history.replaceState({}, '', '/checkout');
        setError('This payment method is no longer supported. Please use PayPal.');
        setErrorAction('payment');
        setCurrentStep('error');
        return;
      }

      // Handle cancellations
      if (status === 'cancelled') {
        sessionStorage.removeItem('paypalCheckoutData');
        toast.info('Payment cancelled');
        setCheckoutData((prev) => ({ ...prev, paymentMethod: null }));
        setCurrentStep('payment-method');
        window.history.replaceState({}, '', '/checkout');
        return;
      }

      const storageKey = 'quickdashCheckout';
      setIsFinalizingPayment(true);

      try {
        const checkoutDataStr = sessionStorage.getItem(storageKey);
        if (!checkoutDataStr) {
          const missingDataMessage =
            'Checkout data was not found after returning from payment. If PayPal charged the customer, contact support with the PayPal confirmation.';
          toast.error(missingDataMessage);
          setError(missingDataMessage);
          setErrorAction('support');
          setCurrentStep('error');
          return;
        }

        const saved: StoredCheckout = JSON.parse(checkoutDataStr);

        /**
         * 🔴 The order already exists. This only settles its payment.
         *
         * The prototype captured at PayPal and THEN tried to create the order,
         * which is why it had an apology for "your payment was successful, but we
         * could not finish recording the order" — a real charge with nothing
         * behind it, recoverable only by hand.
         *
         * QuickDash wrote the order before the shopper ever reached PayPal, and
         * keys settlement on the provider's payment id. Refreshing this page,
         * or returning to it twice, confirms the same order rather than charging
         * again — so there is no longer a window where money moves and the sale
         * does not exist.
         */
        const { settlement } = await store.checkout.capture(saved.externalPaymentId);

        if (!settlement.applied) {
          // The payment did not settle onto the order. The order stays unpaid and
          // is safe to retry; it is never silently treated as sold.
          const reason = settlement.reason ?? 'The payment was not completed.';
          toast.error(reason);
          setError(reason);
          setErrorAction('return');
          setCurrentStep('error');
          return;
        }

        // The referral was recorded at checkout and its reward completed by the
        // capture above, so there is nothing to "apply" here — only the local
        // tracking cookie to retire.
        clearStoredReferralCode();

        sessionStorage.removeItem(storageKey);

        const { receipt } = saved;
        setCheckoutData((prev) => ({
          ...prev,
          customer: saved.customerData,
          paymentMethod: 'paypal',
        }));

        setOrderId(saved.orderNumber);
        setPaymentInfo({
          actualAmount: receipt.totalCents / 100,
          currency: receipt.currency,
        });

        setPreservedItems(
          receipt.lines.map((line) => ({
            id: line.id,
            name: line.name,
            price: line.unitPriceCents / 100,
            quantity: line.quantity,
          })) as typeof items
        );
        setPreservedSubtotal(receipt.subtotalCents / 100);
        setFinalShipping(receipt.shippingCents / 100);

        setCurrentStep('success');
        clearPouch();
        refreshShopProducts();

        items.forEach((item) => {
          refreshProduct(item.id);
        });

        window.history.replaceState({}, '', '/checkout');
        toast.success('Payment successful! Order created.');
      } catch (err) {
        console.error('Checkout error:', err);
        const detail = getCheckoutErrorMessage(err);
        // Retrying is always safe now: the order exists and capture is keyed on
        // the provider's payment id, so a second attempt settles the same sale.
        const supportMessage = `We could not finish confirming the PayPal payment. Your order is recorded and retrying will not charge you twice. Detail: ${detail}`;
        try {
          localStorage.setItem(
            'lastCheckoutError',
            JSON.stringify({
              message: detail,
              paymentMethod,
              at: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore storage failures.
        }
        toast.error(supportMessage);
        setErrorAction('return');
        setCurrentStep('error');
        setError(supportMessage);
      } finally {
        setIsFinalizingPayment(false);
      }
    };

    handlePaymentReturn();
  }, []);

  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<{
    actualAmount: number;
    currency: string;
  } | null>(null);
  // TAX REMOVED
  // TAX REMOVED
  const [discountCode, setDiscountCode] = useState<string>('');
  /**
   * Only what QuickDash confirmed: the code it matched, and the amount IT worked
   * out. No type, no percentage, no free-shipping flag — every one of those was a
   * rule the browser used to re-apply locally, and any drift between its answer
   * and the server's showed up as a total that changed at the last step.
   */
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amountCents: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string>('');
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount
  const discount = (appliedDiscount?.amountCents ?? 0) / 100;
  const subtotalAfterDiscount = subtotal - discount;

  // NO TAX - REMOVED ENTIRELY
  const tax = 0;

  // PRESERVE shipping values at payment completion to prevent recalculation
  const [finalShipping, setFinalShipping] = useState<number>(0);
  const [shippingLocked, setShippingLocked] = useState<boolean>(false); // Prevent recalculation once locked

  // Calculate shipping dynamically with fresh settings
  const [shipping, setShipping] = useState<number>(0); // Start at 0, will load properly
  /**
   * The id of the rate QuickDash offered, kept so checkout can name it.
   *
   * ⚠️ Checkout takes the ID, not the amount. The server re-prices the rate it
   * issued, so a browser cannot select a $25 express option and pay $5 for it.
   */
  const [shippingRateId, setShippingRateId] = useState<string | null>(null);
  const [shippingCurrency, setShippingCurrency] = useState<CheckoutCurrency>('CAD');
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Shipping calculation function (moved outside useEffect so it can be called manually)
  const calculateShippingCost = async (
    forceRefresh = false,
    customer = checkoutData.customer
  ): Promise<boolean> => {
    // Don't recalculate shipping once we're in payment step (unless forced)
    if (shippingLocked && !forceRefresh) {
      return true;
    }

    // Free shipping is no longer decided here. QuickDash resolves the discount
    // and returns it as `option.free`, so the browser cannot waive its own
    // shipping by setting a flag in local state.

    if (items.length === 0) {
      setShipping(0);
      setShippingRateId(null);
      setShippingCurrency(currentCurrency);
      setShippingError(null);
      return true;
    }

    setIsCalculatingShipping(true);
    try {
      const quote = await store.shipping.quote({
        items: items.map((item) => ({
          catalogItemId: item.id,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          quantity: item.quantity,
        })),
        destination: {
          countryCode: getShippingCountryCode(customer.country || 'Canada'),
          ...(customer.state ? { regionCode: customer.state } : {}),
          ...(customer.zipCode ? { postalCode: customer.zipCode } : {}),
        },
        ...(appliedDiscount?.code ? { discountCode: appliedDiscount.code } : {}),
      });

      // The server priced every option; choosing the cheapest is presentation.
      const cheapest = [...quote.options].sort((a, b) => a.amountCents - b.amountCents)[0];
      if (!cheapest) {
        throw new Error('No shipping rate is available for this address');
      }
      setShipping(cheapest.amountCents / 100);
      setShippingRateId(cheapest.rateId);
      setShippingCurrency('CAD');
      setShippingError(null);
      return true;
    } catch {
      setShippingRateId(null);
      setShippingError('Shipping could not be calculated. Check the address or try again.');
      return false;
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const displaySubtotal = roundMoney(convertPrice(subtotal));
  const displayDiscount = roundMoney(convertPrice(discount));
  const displaySubtotalAfterDiscount = Math.max(0, displaySubtotal - displayDiscount);
  const displayShipping = roundMoney(
    convertCheckoutAmount(shipping, shippingCurrency, currentCurrency, exchangeRate)
  );
  const displayItems = items.map((item) => ({
    ...item,
    price: roundMoney(convertPrice(item.price)),
  }));
  const total = roundMoney(displaySubtotalAfterDiscount + displayShipping); // NO TAX!

  // TAX REMOVED - NO CALCULATION NEEDED

  // TAX REMOVED - NO CURRENCY EFFECT NEEDED

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Ask QuickDash what the code is worth against the real basket.
   *
   * 🔴 The cart goes up; a subtotal never does. The prototype posted the
   * browser's own `orderTotal`, so a shopper could claim any order value to clear
   * a minimum-spend threshold or take a percentage off a number they invented.
   *
   * ⚠️ Referral codes are no longer accepted in this box. QuickDash treats a
   * referral as attribution — it records who brought this customer and pays the
   * REFERRER — and deliberately does not change what this order costs. The code
   * arrives from the share link and rides along to checkout separately.
   */
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a code');
      return;
    }

    setDiscountError('');

    try {
      const preview = await store.discounts.preview({
        code: discountCode.trim(),
        items: items.map((item) => ({
          catalogItemId: item.id,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          quantity: item.quantity,
        })),
      });

      if (!preview.valid) {
        setDiscountError(preview.message);
        return;
      }

      setAppliedDiscount({
        code: preview.code,
        amountCents: preview.discountCents,
      });
      setDiscountCode('');
      toast.success(`${preview.code} applied.`);
    } catch {
      setDiscountError('Error validating code');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handleStepComplete = async (step: CheckoutStep, data?: any) => {
    switch (step) {
      case 'cart':
        setCurrentStep('customer');
        break;
      case 'customer':
        if (isCalculatingShipping) return;
        updateCheckoutData({ customer: data });
        if (!(await calculateShippingCost(false, data))) {
          toast.error('Shipping could not be calculated for this address');
          return;
        }
        setCurrentStep('payment-method');
        break;
      case 'payment-method':
        if (shippingError) {
          toast.error(shippingError);
          setCurrentStep('customer');
          return;
        }
        updateCheckoutData({ paymentMethod: data });
        // Lock shipping calculation to prevent recalculation in payment step
        setShippingLocked(true);
        setCurrentStep('payment');
        break;
      case 'payment':
        setOrderId(data.orderId);
        setPaymentInfo({
          actualAmount: data.actualAmount || total,
          currency: data.currency || 'CAD',
        });

        // PRESERVE items, subtotal, tax, and shipping for OrderSuccess BEFORE clearing pouch
        setPreservedItems(displayItems);
        setPreservedSubtotal(displaySubtotal);
        // NO TAX
        setFinalShipping(displayShipping);

        setCurrentStep('success');
        clearPouch();
        refreshShopProducts(); // Trigger real-time inventory update

        // Also refresh individual product pages for items that were purchased
        items.forEach((item) => {
          refreshProduct(item.id);
        });
        break;
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setErrorAction(
      /stock|sold out|changed price|price has changed|return to your cart/i.test(errorMessage)
        ? 'cart'
        : 'payment'
    );
    setCurrentStep('error');
  };

  const handleErrorBack = () => {
    if (errorAction === 'support' || errorAction === 'return') {
      router.push('/contact-us');
      return;
    }
    setCurrentStep(errorAction === 'cart' ? 'cart' : 'payment-method');
  };

  const handleErrorRetry = () => {
    if (errorAction === 'return') {
      window.location.reload();
      return;
    }
    if (errorAction === 'support') {
      router.push('/contact-us');
      return;
    }
    setCurrentStep(errorAction === 'cart' ? 'cart' : 'payment');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'cart':
        router.push('/shop');
        break;
      case 'customer':
        setCurrentStep('cart');
        break;
      case 'payment-method':
        // Unlock shipping when going back to customer step
        setShippingLocked(false);
        setCurrentStep('customer');
        break;
      case 'payment':
        // Unlock shipping when going back from payment
        setShippingLocked(false);
        setCurrentStep('payment-method');
        break;
      case 'error':
        setCurrentStep('payment');
        break;
    }
  };

  const stepTitles = {
    cart: 'Review Your Order',
    customer: 'Shipping Information',
    'payment-method': 'Choose Payment Method',
    payment: 'Payment Details',
    success: 'Order Confirmed!',
    error: 'Payment Error',
  };

  // Don't redirect if we're completing a payment return, showing success, or showing an error
  const isPaymentReturn =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('payment_method');
  if (isFinalizingPayment) {
    return <PageLoader message="Confirming your PayPal payment and securing your order…" />;
  }
  if (
    items.length === 0 &&
    currentStep !== 'success' &&
    currentStep !== 'error' &&
    !isPaymentReturn &&
    preservedItems.length === 0
  ) {
    if (typeof window !== 'undefined') {
      window.location.href = '/gem-pouch';
    }
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-20 xs:px-5 xs:pt-24 sm:px-6 md:px-12 md:pt-24 lg:px-24 lg:pb-20 lg:pt-28 xl:px-32 3xl:px-40">
        {/* Back Button */}
        {currentStep !== 'success' && (
          <button
            onClick={goBack}
            className="mb-6 inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-sm text-white/70 transition-colors hover:text-white"
          >
            <IconArrowLeft size={18} />
            Back
          </button>
        )}

        {/* Step Progress Indicator */}
        {!['success', 'error'].includes(currentStep) && (
          <div className="mb-6 flex items-center justify-center gap-2 xs:mb-8">
            {(['cart', 'customer', 'payment-method', 'payment'] as const).map((step, index) => {
              const stepLabels = ['Cart', 'Shipping', 'Method', 'Pay'];
              const stepOrder = ['cart', 'customer', 'payment-method', 'payment'];
              const currentIndex = stepOrder.indexOf(currentStep);
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors xs:h-8 xs:w-8 xs:text-sm ${
                        isCompleted
                          ? 'bg-white text-black'
                          : isCurrent
                            ? 'border-2 border-white bg-white/10 text-white'
                            : 'border border-white/20 bg-transparent text-white/40'
                      }`}
                    >
                      {isCompleted ? <IconCheck size={14} /> : index + 1}
                    </div>
                    <span
                      className={`mt-1 font-[family-name:var(--font-inter)] text-[10px] xs:text-xs ${isCurrent ? 'text-white' : 'text-white/40'}`}
                    >
                      {stepLabels[index]}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`mx-1.5 mb-4 h-px w-6 xs:mx-2 xs:w-8 sm:w-12 ${index < currentIndex ? 'bg-white' : 'bg-white/20'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Page Title */}
        {currentStep !== 'error' && (
          <h1
            className={`mb-8 text-center font-[family-name:var(--font-bacasime)] text-3xl text-white xs:text-4xl md:text-5xl lg:text-left ${currentStep === 'success' ? 'lg:text-center' : ''}`}
          >
            {stepTitles[currentStep]}
          </h1>
        )}

        {/* Step Content */}
        <div>
          <div className="text-white">
            {currentStep === 'cart' && (
              <CartReview
                items={items}
                onContinue={() => handleStepComplete('cart')}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                appliedDiscount={appliedDiscount}
                discountError={discountError}
                validateDiscountCode={validateDiscountCode}
                removeDiscount={removeDiscount}
              />
            )}

            {currentStep === 'customer' && (
              <CustomerInfo
                data={checkoutData.customer}
                onContinue={(customerData) => handleStepComplete('customer', customerData)}
                isCalculatingShipping={isCalculatingShipping}
                shippingError={shippingError}
                onAddressChange={(customerData) => {
                  updateCheckoutData({ customer: customerData });
                  setShippingError(null);
                }}
              />
            )}

            {currentStep === 'payment-method' && (
              <PaymentMethods onSelect={(method) => handleStepComplete('payment-method', method)} />
            )}

            {currentStep === 'payment' && shippingRateId && (
              <PaymentForm
                paymentMethod={checkoutData.paymentMethod!}
                amount={total}
                currency={currentCurrency}
                customerData={checkoutData.customer}
                items={items}
                /**
                 * The catalog-currency total, in cents — NOT the converted one on
                 * screen. QuickDash prices in the catalog's own currency, so a
                 * shopper browsing in USD must still be compared against CAD or
                 * the guard would fire on every order.
                 */
                expectedTotalCents={Math.round((subtotalAfterDiscount + shipping) * 100)}
                discountCode={appliedDiscount?.code ?? null}
                referralCode={referralCode}
                shippingRateId={shippingRateId}
                countryCode={getShippingCountryCode(checkoutData.customer.country || 'Canada')}
                onError={handleError}
              />
            )}

            {currentStep === 'success' && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <OrderSuccess
                    orderId={orderId}
                    customerEmail={checkoutData.customer.email}
                    customerName={`${checkoutData.customer.firstName} ${checkoutData.customer.lastName}`}
                    amount={paymentInfo?.actualAmount || total}
                    currency={paymentInfo?.currency || 'CAD'}
                    items={preservedItems}
                    subtotal={preservedSubtotal}
                    shipping={finalShipping || shipping}
                    appliedDiscount={appliedDiscount ?? undefined}
                    shippingAddress={checkoutData.customer}
                  />
                </div>
              </div>
            )}

            {currentStep === 'error' && (
              <PaymentError
                message={error}
                title={errorAction === 'return' ? 'Order Confirmation Interrupted' : undefined}
                backLabel={
                  errorAction === 'return' || errorAction === 'support'
                    ? 'Contact Support'
                    : errorAction === 'cart'
                      ? 'Review Cart'
                      : 'Back'
                }
                retryLabel={
                  errorAction === 'return'
                    ? 'Retry Confirmation'
                    : errorAction === 'support'
                      ? 'Contact Support'
                      : errorAction === 'cart'
                        ? 'Review Cart'
                        : 'Try Again'
                }
                onBack={handleErrorBack}
                onRetry={handleErrorRetry}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
