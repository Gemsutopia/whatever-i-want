import { QuickApiError } from '@quickengine/quick/browser';
import { StorefrontError } from './storefront-client';

/**
 * Turn a failure into something a shopper can act on.
 *
 * 🔴 `QuickApiError` has to be handled here, not just `StorefrontError`.
 * QuickConnect replaced the prototype transport, and this file was not updated
 * with it — so every real failure, including a 403 from an unregistered domain
 * and a 500 from the API, fell through to the generic "could not reach the
 * store service". The message was the same whatever went wrong, which made
 * every problem look like a network blip and hid the actual cause.
 */

/** What went wrong, in words, or null if this error is not from QuickDash. */
function apiMessage(status: number, code: string): string | null {
  // 🔴 The one worth spelling out. A storefront key is locked to the addresses
  // registered on it, so this is almost always "this site's domain isn't on the
  // key" rather than anything the shopper did.
  if (status === 401 || status === 403) {
    return code === 'ORIGIN_NOT_ALLOWED'
      ? 'This site is not authorized to reach the store yet.'
      : 'The store connection is not authorized. Please try again shortly.';
  }
  if (status === 404) return 'The requested information could not be found.';
  if (status === 409) return 'That changed while you were looking at it. Refresh and try again.';
  if (status === 422) return 'That is not possible right now. Refresh and try again.';
  if (status === 429) {
    return 'The store is receiving too many requests. Wait a moment and try again.';
  }
  if (status >= 500) {
    return 'The store service is temporarily unavailable. Your cart and saved items are safe.';
  }
  return null;
}

export function getCommerceErrorMessage(error: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your connection and try again.';
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'The store took too long to respond. Please try again.';
  }

  if (error instanceof QuickApiError) {
    const message =
      apiMessage(error.status, error.code) ??
      // A 400 carries a reason worth showing — "that code has expired", "one of
      // those items is not available" — and QuickDash writes them for shoppers.
      (error.status === 400 ? error.message : null) ??
      'We could not reach the store service. Please try again.';
    return withDetail(message, `${error.code} ${error.status}`, error.requestId);
  }

  if (error instanceof StorefrontError) {
    return (
      apiMessage(error.status, '') ?? 'We could not reach the store service. Please try again.'
    );
  }

  return withDetail(
    'We could not reach the store service. Please try again.',
    error instanceof Error ? error.message : String(error),
    null
  );
}

/**
 * In development, say what actually happened.
 *
 * ⚠️ Never in production. A request id and an error code are fine for us and
 * meaningless-to-alarming for a shopper, and the underlying message can leak
 * detail about the API that a public storefront should not repeat.
 */
function withDetail(message: string, detail: string, requestId: string | null): string {
  if (process.env.NODE_ENV === 'production') return message;
  const parts = [detail, requestId && `request ${requestId}`].filter(Boolean);
  return parts.length ? `${message} [dev: ${parts.join(' · ')}]` : message;
}
