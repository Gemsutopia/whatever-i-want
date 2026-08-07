import {
  createQuickConnect,
  type QuickCatalogAvailability,
  type QuickCatalogItem,
  type QuickCatalogVariant,
  type QuickCheckoutInput,
  type QuickCheckoutItem,
  type QuickCheckoutResult,
  type QuickShippingQuote,
} from '@quickengine/quick/browser';

/**
 * Storefront API Client
 *
 * A simple, framework-agnostic client for connecting to the Quickdash Storefront API.
 * Drop this file into any frontend project and configure with your API key.
 *
 * Usage:
 *   const store = new StorefrontClient({ apiKey: 'sf_xxxxx' })
 *   const products = await store.products.list()
 */

export type StorefrontConfig = {
  apiKey: string;
  workspaceId: string;
  baseUrl?: string;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
};

// ============================================
// Types
// ============================================

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  images: string[] | null;
  thumbnail: string | null;
  isSubscribable: boolean | null;
  isFeatured: boolean | null;
  category: { id: string; name: string | null; slug: string | null } | null;
  tags: string[] | null;
  variants?: {
    id: string;
    name: string | null;
    sku: string | null;
    price: string | null;
    attributes?: Record<string, unknown> | null;
  }[];
  stock?: { variantId: string; quantity: number }[] | null;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number | null;
  productCount?: number;
};

export type Auction = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  type: string;
  status: string;
  startingPrice: string;
  currentBid: string | null;
  bidCount: number | null;
  reserveMet: boolean | null;
  startsAt: string;
  endsAt: string;
  autoExtend: boolean | null;
  autoExtendMinutes: number | null;
  product: { id: string; name: string; slug: string; thumbnail: string | null } | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  total: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  currency?: string | null;
};

export type OrderDetail = Order & {
  discountAmount: string | null;
  customerNotes: string | null;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    unitPrice: string;
    quantity: number;
    totalPrice: string;
  }>;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  payment: {
    status: string;
    method: string;
    provider: string;
    currency: string;
  } | null;
};

export type Address = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean | null;
};

export type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  image: string | null;
  addresses?: Address[];
};

export type AuthResponse = {
  user: Customer;
  token: string;
};

export type SiteSettings = {
  name: string;
  tagline: string | null;
  description: string | null;
  logo: string | null;
  favicon: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string | null;
    accentColor: string | null;
  };
  currency: string;
  currencySymbol: string;
  taxRate: number | null;
  freeShippingThreshold: number | null;
  legal: {
    termsUrl: string | null;
    privacyUrl: string | null;
    refundPolicyUrl: string | null;
  };
  seo: {
    title: string | null;
    description: string | null;
    socialImage: string | null;
    keywords: string | null;
    author: string | null;
    openGraphTitle: string | null;
    openGraphDescription: string | null;
    openGraphImage: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: string | null;
  };
  payments?: {
    methods: PaymentMethod[];
    currency: string;
    acceptedCurrencies: string[];
  };
  pusher?: {
    key: string;
    cluster: string;
    channelPrefix: string;
    authEndpoint: string;
  } | null;
};

export type PaymentMethod = {
  provider: string;
  type: string;
  publishableKey?: string;
  clientId?: string;
  projectId?: string;
  chains?: string[];
  applicationId?: string;
  mode?: string;
  testMode?: boolean;
};

export type ShippingRate = {
  id: string;
  name: string;
  carrier: string;
  price: number;
  estimatedDays: string | null;
  isFree: boolean;
};

export type WishlistItem = {
  id: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    thumbnail: string | null;
    images: string[] | null;
    isActive: boolean | null;
  };
};

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean | null;
  helpfulCount: number | null;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
};

/**
 * QuickDash's authoritative answer about a discount code.
 *
 * Every figure is in cents and comes from the server pricing the real basket.
 * There is deliberately no `type`/`value` pair here: what the rule IS belongs to
 * the operator in QuickDash, and a storefront that recomputed `percentage × my
 * subtotal` would eventually disagree with the charge.
 */
export type QuickDiscountPreview =
  | {
      valid: true;
      code: string;
      subtotalCents: number;
      discountCents: number;
      totalAfterDiscountCents: number;
      currency: string;
    }
  | { valid: false; reason: string; message: string };

/**
 * No `unread` flag, deliberately. QuickDash tracks read state per MESSAGE
 * (`readByCustomerAt`) and its conversation list does not aggregate it, so a
 * badge here would be the storefront guessing. Opening a thread calls
 * `messages.markRead`, which is what actually clears it.
 */
export type CustomerConversation = {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  lastMessageAt: string;
};

export type ConversationMessage = {
  id: string;
  sender: 'customer' | 'operator';
  body: string;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number | null;
  isFeatured: boolean | null;
};

export type StatItem = {
  id: string;
  title: string;
  value: string;
  description: string | null;
  icon: string | null;
  sortOrder: number | null;
};

export type Testimonial = {
  id: string;
  reviewerName: string;
  rating: number;
  title: string | null;
  content: string;
  isFeatured: boolean | null;
  createdAt: string;
};

export type SiteContentItem = {
  id: string;
  key: string;
  type: string;
  value: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  tags: string[] | null;
  publishedAt: string | null;
  authorName: string | null;
  authorImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type SitePage = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

const metadataString = (metadata: Record<string, unknown>, key: string): string | null =>
  typeof metadata[key] === 'string' ? metadata[key] : null;

const metadataStrings = (metadata: Record<string, unknown>, key: string): string[] =>
  Array.isArray(metadata[key])
    ? metadata[key].filter((value): value is string => typeof value === 'string')
    : [];

const cents = (value: number | null | undefined): string => ((value ?? 0) / 100).toFixed(2);

const flattenCategories = <T extends { children?: T[] }>(items: T[]): T[] =>
  items.flatMap((item) => [item, ...flattenCategories(item.children ?? [])]);

/**
 * QuickDash returns the whole order row, and its typed surface covers the common
 * columns while leaving the rest as `unknown`. These two readers pull the extra
 * ones — tax, shipping, discount, ship-to — without an `any` cast per field.
 */
const numberField = (record: Record<string, unknown>, key: string): number =>
  typeof record[key] === 'number' ? (record[key] as number) : 0;

const stringField = (record: Record<string, unknown>, key: string): string | null =>
  typeof record[key] === 'string' && record[key] !== '' ? (record[key] as string) : null;

type QuickShipmentSummary = {
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

/**
 * A QuickDash order in the shape Gemsutopia's pages already render.
 *
 * ⚠️ Money crosses as integer cents and is formatted here, once. The prototype
 * passed decimal strings the browser then parsed with `Number()`, which is how a
 * total could drift a penny between the order page and the receipt.
 *
 * Dispatch and delivery dates come from the SHIPMENT, not the order: an order is
 * "confirmed" the moment it is paid, and only its shipment knows when it left.
 */
function mapQuickOrder(
  order: Record<string, unknown> & {
    id: string;
    number: string;
    status: string;
    currency: string;
    subtotalCents: number;
    totalCents: number;
    createdAt: string;
  },
  shipment?: QuickShipmentSummary | null
): Order {
  return {
    id: order.id,
    orderNumber: order.number,
    status: order.status,
    subtotal: cents(order.subtotalCents),
    taxAmount: cents(numberField(order, 'taxCents')),
    shippingAmount: cents(numberField(order, 'shippingCents')),
    total: cents(order.totalCents),
    trackingNumber: shipment?.trackingNumber ?? null,
    trackingUrl: shipment?.trackingUrl ?? null,
    createdAt: order.createdAt,
    shippedAt: shipment?.shippedAt ?? null,
    deliveredAt: shipment?.deliveredAt ?? null,
    currency: order.currency,
  };
}

const mapConversation = (row: {
  id: string;
  subject: string;
  status: string;
  lastMessageAt: string;
}): CustomerConversation => ({
  id: row.id,
  subject: row.subject,
  status: row.status === 'closed' ? 'closed' : 'open',
  lastMessageAt: row.lastMessageAt,
});

/** The delivery address as it was snapshotted onto the order at checkout. */
function mapShipTo(order: Record<string, unknown>): Address | null {
  const line1 = stringField(order, 'shipToLine1');
  if (!line1) return null;
  const name = stringField(order, 'shipToName') ?? '';
  const [firstName, ...rest] = name.split(' ');
  return {
    id: '',
    firstName: firstName ?? '',
    lastName: rest.join(' '),
    company: null,
    addressLine1: line1,
    addressLine2: stringField(order, 'shipToLine2'),
    city: stringField(order, 'shipToCity') ?? '',
    state: stringField(order, 'shipToRegion') ?? '',
    postalCode: stringField(order, 'shipToPostalCode') ?? '',
    country: stringField(order, 'shipToCountryCode') ?? '',
    phone: null,
    isDefault: null,
  };
}

// ============================================
// Client
// ============================================

export class StorefrontClient {
  private apiKey: string;
  private baseUrl: string;
  private workspaceId: string;
  private customerToken: string | null = null;
  private quick: ReturnType<typeof createQuickConnect>;

  constructor(config: StorefrontConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://api.quickdash.xyz';
    this.workspaceId = config.workspaceId;
    this.quick = this.createQuickClient();
  }

  private createQuickClient(customerSession?: string) {
    return createQuickConnect({
      baseUrl: this.baseUrl,
      workspaceId: this.workspaceId,
      credential: {
        type: 'site',
        key: this.apiKey,
        ...(customerSession ? { customerSession } : {}),
      },
    });
  }

  /**
   * Set the customer auth token (after login/register)
   */
  setCustomerToken(token: string | null) {
    this.customerToken = token;
    this.quick = this.createQuickClient(token ?? undefined);
  }

  /**
   * Get the current customer token
   */
  getCustomerToken(): string | null {
    return this.customerToken;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params, token } = options;

    // Build URL with query params
    let url = `${this.baseUrl}/api/storefront${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      'X-Storefront-Key': this.apiKey,
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const authToken = token || this.customerToken;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(process.env.NODE_ENV === 'development' ? 2500 : 8000),
    });

    const responseText = await response.text();
    let data: any = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        if (!response.ok) {
          throw new StorefrontError(
            `QuickDash returned an invalid response (${response.status})`,
            response.status,
            { responseText: responseText.slice(0, 500) }
          );
        }
        throw new StorefrontError('QuickDash returned invalid JSON', 502);
      }
    }

    if (!response.ok) {
      const message =
        typeof data.error === 'string'
          ? data.error
          : data.error?.message || data.message || `QuickDash request failed (${response.status})`;
      throw new StorefrontError(message, response.status, data);
    }

    return data as T;
  }

  private async mapQuickProduct(
    item: QuickCatalogItem,
    category: Category | null = null,
    knownAvailability?: QuickCatalogAvailability[]
  ): Promise<Product> {
    const [variantsResult, availabilityResult] = await Promise.all([
      this.quick.catalog.listVariants(item.id),
      knownAvailability ? null : this.quick.site.availability([item.id]),
    ]);
    const variants = variantsResult.data.filter((variant) => variant.status === 'active');
    const availability = knownAvailability ?? availabilityResult?.data ?? [];
    const images = metadataStrings(item.metadata, 'images');
    const thumbnail = metadataString(item.metadata, 'thumbnail') ?? images[0] ?? null;
    const compareAtPriceCents =
      typeof item.metadata.compareAtPriceCents === 'number'
        ? item.metadata.compareAtPriceCents
        : null;

    return {
      id: item.id,
      name: item.name,
      slug: metadataString(item.metadata, 'slug') ?? item.id,
      description: item.description,
      shortDescription: metadataString(item.metadata, 'shortDescription'),
      price: cents(item.priceCents),
      compareAtPrice: compareAtPriceCents === null ? null : cents(compareAtPriceCents),
      images,
      thumbnail,
      isSubscribable: Boolean(item.metadata.subscribable),
      isFeatured: Boolean(item.metadata.featured),
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      tags: metadataStrings(item.metadata, 'tags'),
      variants: variants.map((variant) => this.mapQuickVariant(variant, item.priceCents)),
      stock: availability.map((entry) => ({
        variantId: entry.catalogItemVariantId ?? item.id,
        quantity: entry.availableQuantity ?? (entry.available ? Number.MAX_SAFE_INTEGER : 0),
      })),
      createdAt: item.createdAt,
      metadata: item.metadata,
    } as Product;
  }

  private mapQuickVariant(variant: QuickCatalogVariant, fallbackPrice: number | null) {
    return {
      id: variant.id,
      name: variant.options.map((option) => option.value).join(' / ') || variant.combinationKey,
      sku: variant.sku,
      price: cents(variant.priceCentsOverride ?? fallbackPrice),
      attributes: Object.fromEntries(variant.options.map((option) => [option.name, option.value])),
    };
  }

  // ============================================
  // Products
  // ============================================

  products = {
    list: async (options?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      featured?: boolean;
      subscribable?: boolean;
      sort?: 'name' | 'price' | 'createdAt';
      order?: 'asc' | 'desc';
    }): Promise<{ products: Product[]; pagination: Pagination }> => {
      const catalog: QuickCatalogItem[] = [];
      let cursor: string | undefined;
      do {
        const result = await this.quick.catalog.list({
          cursor,
          limit: 100,
          sort: options?.sort === 'createdAt' ? 'createdAt' : options?.sort,
          direction: options?.order,
        });
        catalog.push(...result.data.items);
        cursor = result.data.page.nextCursor ?? undefined;
      } while (cursor);

      let category: Category | null = null;
      let categoryItemIds: Set<string> | null = null;
      if (options?.category) {
        const categoryResult = await this.quick.site.listCategories('category');
        const match = flattenCategories(categoryResult.data.items).find(
          (item) => item.slug === options.category
        );
        if (match) {
          category = {
            id: match.id,
            name: match.name,
            slug: match.slug,
            description: typeof match.description === 'string' ? match.description : null,
            image: typeof match.image === 'string' ? match.image : null,
            parentId: typeof match.parentId === 'string' ? match.parentId : null,
            sortOrder: typeof match.sortOrder === 'number' ? match.sortOrder : 0,
            productCount: match.itemCount,
          };
          const membership = await this.quick.site.listCategoryItems(match.slug);
          categoryItemIds = new Set(membership.data.itemIds);
        } else {
          categoryItemIds = new Set();
        }
      }

      const search = options?.search?.trim().toLowerCase();
      const filtered = catalog.filter((item) => {
        if (categoryItemIds && !categoryItemIds.has(item.id)) return false;
        if (search && !`${item.name} ${item.description ?? ''}`.toLowerCase().includes(search)) {
          return false;
        }
        if (
          options?.featured !== undefined &&
          Boolean(item.metadata.featured) !== options.featured
        ) {
          return false;
        }
        if (
          options?.subscribable !== undefined &&
          Boolean(item.metadata.subscribable) !== options.subscribable
        ) {
          return false;
        }
        return true;
      });

      if (options?.sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
      if (options?.sort === 'price')
        filtered.sort((a, b) => (a.priceCents ?? 0) - (b.priceCents ?? 0));
      if (options?.order === 'desc' && options.sort !== 'createdAt') filtered.reverse();

      const page = Math.max(1, options?.page ?? 1);
      const limit = Math.max(1, options?.limit ?? 20);
      const pageItems = filtered.slice((page - 1) * limit, page * limit);
      const availability = pageItems.length
        ? (await this.quick.site.availability(pageItems.map((item) => item.id))).data
        : [];
      const products = await Promise.all(
        pageItems.map((item) =>
          this.mapQuickProduct(
            item,
            category,
            availability.filter((entry) => entry.catalogItemId === item.id)
          )
        )
      );
      return {
        products,
        pagination: {
          page,
          limit,
          totalCount: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
          hasMore: page * limit < filtered.length,
        },
      };
    },

    get: async (idOrSlug: string): Promise<{ product: Product }> => {
      try {
        const result = await this.quick.catalog.get(idOrSlug);
        return { product: await this.mapQuickProduct(result.data) };
      } catch (error) {
        if (!(error instanceof Error) || !('status' in error) || error.status !== 404) throw error;
        const listed = await this.quick.catalog.list({ limit: 100 });
        const item = listed.data.items.find(
          (candidate) => metadataString(candidate.metadata, 'slug') === idOrSlug
        );
        if (!item) throw new StorefrontError('Product not found', 404, error);
        return { product: await this.mapQuickProduct(item) };
      }
    },
  };

  // ============================================
  // Categories
  // ============================================

  categories = {
    list: async (options?: {
      count?: boolean;
      parentOnly?: boolean;
    }): Promise<{ categories: Category[] }> => {
      const result = await this.quick.site.listCategories('category');
      const source = options?.parentOnly ? result.data.items : flattenCategories(result.data.items);
      return {
        categories: source.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: typeof item.description === 'string' ? item.description : null,
          image: typeof item.image === 'string' ? item.image : null,
          parentId: typeof item.parentId === 'string' ? item.parentId : null,
          sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
          productCount: options?.count ? item.itemCount : undefined,
        })),
      };
    },
  };

  // ============================================
  // Auctions
  // ============================================

  auctions = {
    list: async (options?: {
      page?: number;
      limit?: number;
      status?: 'active' | 'scheduled' | 'upcoming' | 'ended';
      type?: 'reserve' | 'no_reserve';
      sort?: 'endsAt' | 'startsAt' | 'currentBid' | 'bidCount' | 'createdAt';
      order?: 'asc' | 'desc';
    }): Promise<{ auctions: Auction[]; pagination: Pagination }> => {
      return this.request('/auctions', {
        params: {
          page: options?.page,
          limit: options?.limit,
          status: options?.status,
          type: options?.type,
          sort: options?.sort,
          order: options?.order,
        },
      });
    },

    get: async (id: string): Promise<{ auction: Auction }> => {
      return this.request(`/auctions/${id}`);
    },

    getBids: async (
      id: string,
      limit = 20
    ): Promise<{
      bids: {
        id: string;
        amount: string;
        bidderName: string;
        isWinning: boolean;
        status: string;
        createdAt: string;
      }[];
    }> => {
      return this.request(`/auctions/${id}/bids`, { params: { limit } });
    },

    placeBid: async (
      id: string,
      data: {
        amount: number;
        bidderEmail: string;
        bidderName: string;
      }
    ): Promise<{ bid: { id: string; amount: string }; reserveMet: boolean }> => {
      return this.request(`/auctions/${id}/bids`, {
        method: 'POST',
        body: data,
      });
    },

    getMyBids: async (): Promise<{
      bids: Record<string, unknown>[];
      stats: Record<string, number>;
    }> => {
      return this.request('/auctions/bids/me');
    },
  };

  // ============================================
  // Auth
  // ============================================

  auth = {
    requestSignInLink: async (email: string, callbackUrl?: string): Promise<{ sent: true }> => {
      const response = await this.quick.customer.requestSignInLink(email, callbackUrl);
      return response.data;
    },

    verifySignInLink: async (token: string) => {
      const response = await this.quick.customer.verifySignInLink(token);
      this.setCustomerToken(response.data.token);
      return response.data;
    },

    logout: async () => {
      if (this.customerToken) await this.quick.customer.signOut();
      this.setCustomerToken(null);
    },

    /**
     * A one-use ticket for sending this signed-in shopper to the hosted portal.
     *
     * 🔴 NEVER send `customerToken` itself to the portal — not in the URL, not in
     * a cookie on a shared parent domain, not by `postMessage`. That token is
     * this storefront's session; putting it on a second origin means a leak on
     * either compromises both, and signing out here could not revoke it there.
     *
     * This ticket lives for about a minute, works exactly once, and buys the
     * portal a separate session of its own.
     */
    requestPortalHandoff: async (): Promise<{ token: string; expiresAt: string }> => {
      const response = await this.quick.customer.requestPortalHandoff();
      return response.data;
    },

    getProfile: async () => {
      const response = await this.quick.customer.me();
      return {
        user: {
          id: response.data.customerId,
          email: response.data.email,
          name: response.data.email.split('@')[0] || 'Customer',
          phone: null,
          image: null,
          addresses: [],
        } as Customer,
      };
    },

    updateProfile: async (data: {
      name?: string;
      phone?: string;
      image?: string;
    }): Promise<{ user: Customer }> => {
      return this.request('/auth/me', {
        method: 'PATCH',
        body: data,
      });
    },

    changePassword: async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<{ success: boolean }> => {
      return this.request('/auth/password', {
        method: 'POST',
        body: data,
      });
    },

    deleteAccount: async (): Promise<{ success: boolean }> => {
      return this.request('/auth/me', { method: 'DELETE' });
    },

    getAddresses: async (): Promise<{ addresses: Address[] }> => {
      return this.request('/auth/addresses');
    },

    addAddress: async (data: Omit<Address, 'id'>): Promise<{ address: Address }> => {
      return this.request('/auth/addresses', {
        method: 'POST',
        body: data,
      });
    },

    deleteAddress: async (addressId: string): Promise<{ success: boolean }> => {
      return this.request('/auth/addresses', {
        method: 'DELETE',
        params: { id: addressId },
      });
    },
  };

  // ============================================
  // Orders
  // ============================================

  /**
   * The signed-in shopper's OWN orders.
   *
   * 🔴 Note what is missing: no `customerId` parameter, on any of these. The
   * prototype's `/orders?customer_id=…` trusted the browser to say whose orders
   * it wanted, so changing one query value read a stranger's purchase history.
   * QuickDash fixes the client record from the customer SESSION in middleware —
   * there is no parameter to tamper with, and a verified customer with no
   * records gets an empty list rather than an unfiltered one.
   *
   * `create` is gone too: an order is now born inside `checkout.create`, in the
   * same transaction that prices it. Nothing may post an order from a browser.
   */
  orders = {
    list: async (options?: {
      limit?: number;
      cursor?: string;
    }): Promise<{ orders: Order[]; pagination: Pagination }> => {
      const result = await this.quick.customer.listOrders({
        ...(options?.limit ? { limit: options.limit } : {}),
        ...(options?.cursor ? { cursor: options.cursor } : {}),
        direction: 'desc',
      });
      const orders = result.data.items.map((order) => mapQuickOrder(order));
      return {
        orders,
        pagination: {
          page: 1,
          limit: options?.limit ?? orders.length,
          totalCount: orders.length,
          totalPages: 1,
          hasMore: Boolean(result.data.page?.nextCursor),
        },
      };
    },

    get: async (orderId: string): Promise<{ order: OrderDetail }> => {
      const result = await this.quick.customer.getOrder(orderId);
      const detail = result.data;
      // The newest shipment is the one a customer means by "where is my order".
      const shipment = detail.shipments?.[0] ?? null;
      return {
        order: {
          ...mapQuickOrder(detail, shipment),
          discountAmount: cents(numberField(detail, 'discountCents')),
          customerNotes: detail.notes,
          items: (detail.lineItems ?? []).map((line) => ({
            id: line.id,
            productName: line.name,
            variantName: stringField(line, 'variantName'),
            sku: stringField(line, 'sku'),
            unitPrice: cents(line.unitPriceCents),
            quantity: line.quantity,
            totalPrice: cents(line.lineTotalCents),
          })),
          shippingAddress: mapShipTo(detail),
          // QuickDash bills to the payment instrument, so it stores no separate
          // billing address. Showing the shipping address twice would be a lie.
          billingAddress: null,
          payment: detail.payment
            ? {
                status: detail.payment.status,
                method: detail.payment.provider,
                provider: detail.payment.provider,
                currency: detail.payment.currency,
              }
            : null,
        },
      };
    },
  };

  // ============================================
  // Checkout
  // ============================================

  checkout = {
    /**
     * Create the order and start its payment, in one server-authoritative call.
     *
     * 🔴 This replaces THREE prototype calls that used to run in a fragile order:
     * `payments.createPayPalOrder` → provider approval → `orders.create`. Under
     * that shape the order only existed AFTER the money moved, so a browser that
     * closed on the return trip left a real charge with no order behind it — the
     * "payment was successful, but we could not finish recording the order" path
     * the old checkout had to apologise for.
     *
     * QuickDash writes the order, its idempotency record, its audit entry and its
     * outbox message in one transaction, then opens the payment against that
     * order. `externalPaymentId` comes back already linked, so settlement always
     * has somewhere to land.
     *
     * ⚠️ No price, subtotal, tax, discount or currency is sent. Only the CODE for
     * a discount and the ID of a rate the server itself offered. Everything else
     * is priced from the catalog.
     */
    create: async (
      input: QuickCheckoutInput,
      idempotencyKey: string
    ): Promise<QuickCheckoutResult> => {
      const result = await this.quick.site.checkout(input, idempotencyKey);
      return result.data;
    },

    /**
     * Settle a payment the shopper approved at the provider.
     *
     * Safe to call twice: QuickDash keys settlement on the provider's payment id,
     * so a refreshed return page confirms the same order rather than charging
     * again. Completing the referral reward is part of this call, which is why
     * the prototype's separate `/referrals/apply` request is gone.
     */
    capture: async (
      externalPaymentId: string
    ): Promise<{
      captured: true;
      settlement: { applied: boolean; reason?: string; orderId?: string };
    }> => {
      const result = await this.quick.site.capture(externalPaymentId);
      return result.data;
    },
  };

  // ============================================
  // Payments
  // ============================================

  payments = {
    /**
     * Whether this workspace can take money at all.
     *
     * ⚠️ Deliberately thin, and deliberately NOT a list of card brands. The
     * prototype's `/payments/methods` let the browser learn the provider before
     * checkout and then send that provider back as part of the order, which made
     * a client-supplied string decide where money went.
     *
     * QuickDash names the provider in the checkout RESPONSE instead
     * (`payment.provider` and `payment.nextAction`), so it is chosen by the
     * workspace's connected account and never by the page. All this call answers
     * is the question the payment step needs beforehand: is the payments module
     * switched on? If no account is connected, `checkout.create` says so in
     * `paymentUnavailableReason` and the shopper sees the real reason.
     */
    isAvailable: async (): Promise<boolean> => {
      const result = await this.quick.site.context();
      return result.data.modules.includes('payments');
    },
  };

  // ============================================
  // Discounts
  // ============================================

  discounts = {
    /**
     * What a code is actually worth against the real basket.
     *
     * Replaces the prototype `/api/storefront/discounts/validate`, which took a
     * browser-supplied `subtotal`. That let anyone claim a $10,000 order to clear
     * a minimum-spend threshold, or take a percentage off a number they invented.
     * QuickDash now prices the same items it would price at checkout, so the
     * preview and the charge cannot disagree.
     *
     * An expired or unknown code comes back `valid: false` with a shopper-facing
     * message — it is a normal answer, not a thrown error.
     */
    preview: async (input: {
      code: string;
      items: QuickCheckoutItem[];
    }): Promise<QuickDiscountPreview> => {
      const result = await this.quick.site.previewDiscount(input);
      return result.data;
    },
  };

  // ============================================
  // Site
  // ============================================

  site = {
    getSettings: async (): Promise<{ site: SiteSettings }> => {
      const [contextResult, contentResult] = await Promise.all([
        this.quick.site.context(),
        this.quick.site.content(),
      ]);
      const content = contentResult.data.content;
      const value = (key: string, fallback: string | null = null) => {
        const candidate = content[key] ?? content[key.replace('.', ':')];
        return typeof candidate === 'string' ? candidate : fallback;
      };
      return {
        site: {
          name: value('site.name', contextResult.data.workspace.name)!,
          tagline: value('site.tagline'),
          description: value('site.description'),
          logo: value('site.logo'),
          favicon: value('site.favicon'),
          email: value('contact.email'),
          phone: value('contact.phone'),
          address: value('contact.address'),
          social: {
            facebook: value('social.facebook'),
            instagram: value('social.instagram'),
            twitter: value('social.twitter'),
            tiktok: value('social.tiktok'),
            youtube: value('social.youtube'),
          },
          theme: {
            primaryColor: value('theme.primaryColor', '#000000')!,
            secondaryColor: value('theme.secondaryColor'),
            accentColor: value('theme.accentColor'),
          },
          currency: value('commerce.currency', 'CAD')!,
          currencySymbol: value('commerce.currency_symbol', '$')!,
          taxRate: null,
          freeShippingThreshold: null,
          legal: {
            termsUrl: value('legal.termsUrl'),
            privacyUrl: value('legal.privacyUrl'),
            refundPolicyUrl: value('legal.refundPolicyUrl'),
          },
          seo: {
            title: value('seo.title'),
            description: value('seo.description'),
            socialImage: value('seo.socialImage'),
            keywords: value('seo.keywords'),
            author: value('seo.author'),
            openGraphTitle: value('seo.openGraphTitle'),
            openGraphDescription: value('seo.openGraphDescription'),
            openGraphImage: value('seo.openGraphImage'),
            twitterTitle: value('seo.twitterTitle'),
            twitterDescription: value('seo.twitterDescription'),
            twitterImage: value('seo.twitterImage'),
          },
        },
      };
    },
  };

  // ============================================
  // Shipping
  // ============================================

  shipping = {
    /**
     * Server-priced shipping options for the real cart.
     *
     * Replaces the prototype `/api/storefront/shipping/rates` call. The old one
     * took a client-computed subtotal and no items, so the browser decided both
     * the billable weight and whether shipping was free. QuickDash now prices
     * from the actual items and resolves `discountCode` itself, which is why
     * free shipping is an `option.free` flag coming back rather than a branch
     * the checkout takes before asking.
     */
    quote: async (input: {
      items: QuickCheckoutItem[];
      destination: {
        countryCode: string;
        regionCode?: string;
        postalCode?: string;
      };
      discountCode?: string;
    }): Promise<QuickShippingQuote> => {
      const result = await this.quick.site.quoteShipping(input);
      return result.data;
    },
  };

  // ============================================
  // Wishlist
  // ============================================

  wishlist = {
    list: async (): Promise<{ wishlist: WishlistItem[] }> => {
      const result = await this.quick.customer.listWishlist();
      return {
        wishlist: result.data.items.map((item) => ({
          id: item.catalogItemId,
          addedAt: item.addedAt,
          product: {
            id: item.catalogItemId,
            name: item.name,
            slug: item.catalogItemId,
            price: cents(item.priceCents),
            thumbnail: null,
            images: null,
            isActive: item.status === 'active',
          },
        })),
      };
    },

    add: async (productId: string): Promise<{ success: boolean }> => {
      await this.quick.customer.saveWishlistItem({ catalogItemId: productId });
      return { success: true };
    },

    remove: async (productId: string): Promise<{ success: boolean }> => {
      await this.quick.customer.removeWishlistItem(productId);
      return { success: true };
    },

    merge: async (productIds: string[]): Promise<{ merged: number }> => {
      const result = await this.quick.customer.mergeWishlist(
        productIds.map((catalogItemId) => ({ catalogItemId }))
      );
      return result.data;
    },
  };

  // ============================================
  // Reviews
  // ============================================

  reviews = {
    list: async (
      productId: string,
      options?: {
        page?: number;
        limit?: number;
      }
    ): Promise<{
      reviews: Review[];
      summary: { averageRating: number | null; totalReviews: number };
      pagination: Pagination;
    }> => {
      const limit = options?.limit ?? 50;
      const result = await this.quick.catalog.listReviews(productId, limit);
      const reviews = result.data.items.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        isVerifiedPurchase: review.verifiedPurchase,
        helpfulCount: 0,
        createdAt: review.createdAt,
        author: { name: review.authorName, image: null },
      }));
      const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : null;
      return {
        reviews,
        summary: { averageRating, totalReviews: reviews.length },
        pagination: {
          page: options?.page ?? 1,
          limit,
          totalCount: reviews.length,
          totalPages: reviews.length ? 1 : 0,
          hasMore: false,
        },
      };
    },

    create: async (data: {
      productId: string;
      rating: number;
      title?: string;
      body?: string;
    }): Promise<{ review: Review; message: string }> => {
      const result = await this.quick.customer.createReview({
        catalogItemId: data.productId,
        rating: data.rating,
        title: data.title,
        body: data.body,
      });
      return {
        review: {
          id: result.data.id,
          rating: data.rating,
          title: data.title ?? null,
          body: data.body ?? null,
          isVerifiedPurchase: result.data.verifiedPurchase,
          helpfulCount: 0,
          createdAt: new Date().toISOString(),
          author: { name: 'You', image: null },
        },
        message: 'Your review is awaiting approval.',
      };
    },
  };

  // ============================================
  // Collections (Generic)
  // ============================================

  collections = {
    list: async (
      slug: string,
      options?: {
        filter?: Record<string, string>;
        sort?: string;
        order?: string;
      }
    ): Promise<{
      collection: { name: string; slug: string; description: string | null };
      entries: {
        id: string;
        data: Record<string, unknown>;
        sortOrder: number | null;
        createdAt: string;
      }[];
    }> => {
      const params: Record<string, string> = {};
      if (options?.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          params[`filter[${key}]`] = value;
        }
      }
      if (options?.sort) params.sort = options.sort;
      if (options?.order) params.order = options.order;
      return this.request(`/collections/${slug}`, { params });
    },

    submit: async (
      slug: string,
      data: Record<string, unknown>
    ): Promise<{ entry: { id: string; data: Record<string, unknown>; createdAt: string } }> => {
      return this.request(`/collections/${slug}/entries`, {
        method: 'POST',
        body: data,
      });
    },
  };

  // ============================================
  // Contact
  // ============================================

  contact = {
    submit: async (data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }): Promise<{ submissionId: string }> => {
      return this.request('/contact', {
        method: 'POST',
        body: data,
      });
    },
  };

  // ============================================
  // Private customer conversations
  // ============================================

  /**
   * The shopper's private thread with the business.
   *
   * Two-way and durable: the customer writes here, the operator answers from
   * QuickDash's conversation view, and both sides read the same thread. This is
   * not the public contact form — `contact.submit` is a one-shot message from
   * anyone, while these require a verified customer session and are attached to
   * that customer forever.
   *
   * ⚠️ Every method is scoped by the SESSION's `workspaceCustomerId` inside
   * QuickDash. A conversation id belonging to somebody else answers 404, not the
   * thread, so guessing an id reveals nothing.
   */
  messages = {
    list: async (): Promise<{ conversations: CustomerConversation[] }> => {
      const result = await this.quick.customer.listMessages();
      return { conversations: result.data.items.map(mapConversation) };
    },

    get: async (
      conversationId: string
    ): Promise<{
      conversation: CustomerConversation & { messages: ConversationMessage[] };
    }> => {
      const result = await this.quick.customer.getMessage(conversationId);
      const messages = Array.isArray(result.data.messages) ? result.data.messages : [];
      return {
        conversation: {
          ...mapConversation(result.data),
          messages: messages.map((message) => {
            const record = message as Record<string, unknown>;
            return {
              id: String(record.id ?? ''),
              // "customer" or "operator" — who is speaking decides which side of
              // the thread the bubble sits on.
              sender: record.sender === 'operator' ? 'operator' : 'customer',
              body: String(record.body ?? ''),
              createdAt: String(record.createdAt ?? ''),
            };
          }),
        },
      };
    },

    start: async (
      subject: string,
      body: string
    ): Promise<{ conversation: CustomerConversation }> => {
      const result = await this.quick.customer.createMessage(subject, body);
      return { conversation: mapConversation(result.data) };
    },

    reply: async (conversationId: string, body: string): Promise<void> => {
      await this.quick.customer.replyToMessage(conversationId, body);
    },

    markRead: async (conversationId: string): Promise<void> => {
      await this.quick.customer.markMessageRead(conversationId);
    },
  };

  // ============================================
  // FAQ (convenience wrapper)
  // ============================================

  faq = {
    list: async (): Promise<{ faq: FaqItem[] }> => {
      const res = await this.collections.list('faq');
      return {
        faq: res.entries.map((e) => ({
          id: e.id,
          question: e.data.question as string,
          answer: e.data.answer as string,
          category: (e.data.category as string) ?? null,
          sortOrder: e.sortOrder,
          isFeatured: (e.data.isFeatured as boolean) ?? null,
        })),
      };
    },
  };

  // ============================================
  // Stats (convenience wrapper)
  // ============================================

  stats = {
    list: async (): Promise<{ stats: StatItem[] }> => {
      const res = await this.collections.list('stats');
      return {
        stats: res.entries.map((e) => ({
          id: e.id,
          title: e.data.title as string,
          value: e.data.value as string,
          description: (e.data.description as string) ?? null,
          icon: (e.data.icon as string) ?? null,
          sortOrder: e.sortOrder,
        })),
      };
    },
  };

  // ============================================
  // Testimonials (convenience wrapper)
  // ============================================

  testimonials = {
    list: async (options?: { featured?: boolean }): Promise<{ testimonials: Testimonial[] }> => {
      const filter: Record<string, string> = { status: 'approved' };
      if (options?.featured) filter.isFeatured = 'true';
      const res = await this.collections.list('testimonials', { filter });
      return {
        testimonials: res.entries.map((e) => ({
          id: e.id,
          reviewerName: e.data.reviewerName as string,
          rating: e.data.rating as number,
          title: (e.data.title as string) ?? null,
          content: e.data.content as string,
          isFeatured: (e.data.isFeatured as boolean) ?? null,
          createdAt: e.createdAt,
        })),
      };
    },
  };

  // ============================================
  // Site Content
  // ============================================

  siteContent = {
    list: async (): Promise<{ content: SiteContentItem[] }> => {
      const result = await this.quick.site.content();
      return {
        content: Object.entries(result.data.content).map(([key, value]) => ({
          id: key,
          key: key.includes(':') ? key : key.replace('.', ':'),
          type: typeof value,
          value: typeof value === 'string' ? value : value == null ? null : JSON.stringify(value),
        })),
      };
    },
  };

  // ============================================
  // Referrals
  // ============================================

  referrals = {
    generate: async (email: string): Promise<{ referral: unknown }> => {
      void email;
      const result = await this.quick.customer.createReferral();
      return { referral: { code: result.data.code } };
    },

    /**
     * There is deliberately no `validate` or `apply` here any more.
     *
     * The prototype treated a referral code as a kind of discount the browser
     * validated up front and then "applied" in a second call after the order
     * existed — which could silently fail and lose the referrer their reward.
     *
     * QuickDash separates the two. A referral records WHO BROUGHT this customer
     * and never changes what the order costs, so the code is passed to
     * `checkout.create` as `referralCode` and evaluated inside the same request
     * that prices the sale. The reward is then completed by payment capture.
     */
    get: async (email: string): Promise<{ referral: unknown | null }> => {
      void email;
      const result = await this.quick.customer.getReferral();
      return { referral: result.data.referral };
    },
  };

  // ============================================
  // Analytics
  // ============================================

  analytics = {
    track: async (data: {
      sessionId: string;
      visitorId: string;
      eventType?: string;
      pathname: string;
      referrer?: string | null;
      hostname?: string;
      eventData?: Record<string, unknown>;
    }): Promise<{ ok: boolean }> => {
      return this.request('/analytics/track', {
        method: 'POST',
        body: data,
      });
    },
  };

  // ============================================
  // Blog
  // ============================================

  blog = {
    list: async (options?: {
      page?: number;
      limit?: number;
      tag?: string;
      search?: string;
    }): Promise<{ posts: BlogPost[]; pagination: Pagination }> => {
      return this.request('/blog', {
        params: {
          page: options?.page,
          limit: options?.limit,
          tag: options?.tag,
          search: options?.search,
        },
      });
    },

    get: async (slug: string): Promise<{ post: BlogPost }> => {
      return this.request(`/blog/${slug}`);
    },
  };

  // ============================================
  // Pages
  // ============================================

  pages = {
    list: async (): Promise<{ pages: SitePage[] }> => {
      return this.request('/pages');
    },

    get: async (slug: string): Promise<{ page: SitePage }> => {
      return this.request(`/pages/${slug}`);
    },
  };
}

// ============================================
// Error Class
// ============================================

export class StorefrontError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'StorefrontError';
    this.status = status;
    this.data = data;
  }
}

// ============================================
// Default Export
// ============================================

export default StorefrontClient;
