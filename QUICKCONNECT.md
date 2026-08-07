# Gemsutopia and QuickDash

This repository is the isolated integration copy of the Gemsutopia storefront. Its pages and
visual design remain Gemsutopia-owned; `@quickengine/quick` supplies the framework-independent
QuickConnect boundary to the new QuickDash workspace.

## Browser contract

The storefront requires three browser-safe values:

```dotenv
NEXT_PUBLIC_QUICKDASH_API_URL=http://localhost:3020
NEXT_PUBLIC_QUICKDASH_WORKSPACE_ID=<workspace-id>
NEXT_PUBLIC_QUICKDASH_SITE_KEY=<qsf-site-key>
```

Never place a QuickDash secret/scoped operator key, payment-provider secret, webhook secret, or
database URL in the storefront. QuickDash calculates authoritative prices, discounts, shipping,
inventory and checkout totals at the API boundary.

For the disposable local proof, QuickEngine's guarded `pnpm proof:gemsutopia` command seeds only
Docker Postgres on port 5435 and writes this repository's gitignored `apps/web/.env.local`.

## Integration order

1. ✅ Catalog, product detail, categories, published content and authoritative availability.
2. ✅ Passwordless customer identity, storefront session verification, guest wishlist merge,
   published and pending reviews, referral ownership and sign-out revocation.
3. ✅ Discount codes priced against the real basket, and server-priced delivery options.
4. ✅ Server-authoritative checkout: the order and its payment are opened in one call, and the
   return trip only captures. PayPal sandbox capture itself is unproven locally — no credentials.
5. ✅ Owned orders and shipment status, private two-way messages, and a single-use pass into the
   hosted portal that never moves the storefront's session across origins.
6. ✅ `pnpm proof:gemsutopia:lifecycle` covers browse, sign-in, discount, delivery, order,
   isolation, the operator/customer round trip and the portal handoff against Docker.

The intended hosted customer portal is `account.gemsutopia.ca`. Gemsutopia remains the shopping
surface; the hosted portal is the customer's account, order, tracking, invoice and message
surface; QuickDash is Reese's private operating surface.

Storefront sign-in links return to `/auth/verify` on the registered Gemsutopia origin. Portal
sign-in continues to return to the hosted portal. Both sessions are workspace-scoped bearer
sessions and neither origin silently receives the other's browser storage.

## Production cutover

The legacy storefront and prototype QuickDash remain operational until the isolated integration
passes. Production uses a newly issued site key and freshly reconnected payment-provider
credentials. Historical business records are copied through a rehearsed, idempotent import;
password hashes, sessions, cookies, API keys and provider secrets are never migrated.

After count, relationship and money reconciliation, legacy writes are frozen, a final delta is
imported, a real low-value purchase/refund/notification/portal/message flow is verified, and
traffic switches. The legacy system remains read-only during the rollback window.
