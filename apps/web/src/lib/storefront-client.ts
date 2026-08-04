import {
  createQuickConnect,
  type QuickCatalogAvailability,
  type QuickCatalogItem,
  type QuickCatalogVariant,
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

export type Discount = {
  code: string | null;
  type: string;
  value: number;
  discountAmount: number;
  name: string;
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

// ============================================
// Client
// ============================================

export class StorefrontClient {
  private apiKey: string;
  private baseUrl: string;
  private customerToken: string | null = null;
  private quick: ReturnType<typeof createQuickConnect>;

  constructor(config: StorefrontConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://api.quickdash.xyz';
    this.quick = createQuickConnect({
      baseUrl: this.baseUrl,
      workspaceId: config.workspaceId,
      credential: { type: 'site', key: config.apiKey },
    });
  }

  /**
   * Set the customer auth token (after login/register)
   */
  setCustomerToken(token: string | null) {
    this.customerToken = token;
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
    register: async (data: {
      email: string;
      password: string;
      name: string;
      phone?: string;
    }): Promise<AuthResponse> => {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: data,
      });
      this.customerToken = response.token;
      return response;
    },

    login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: data,
      });
      this.customerToken = response.token;
      return response;
    },

    logout: () => {
      this.customerToken = null;
    },

    getProfile: async (): Promise<{ user: Customer }> => {
      return this.request('/auth/me');
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

  orders = {
    track: async (
      orderNumber: string,
      email: string
    ): Promise<{
      order: Order & {
        paymentStatus?: string;
        estimatedDelivery?: string | null;
        carrier?: string | null;
        shippingMethod?: string | null;
        shippingDestination?: string | null;
      };
    }> => {
      return this.request('/orders/track', {
        params: { order_number: orderNumber, email },
      });
    },

    list: async (
      customerId: string,
      options?: {
        page?: number;
        limit?: number;
        status?: string;
      }
    ): Promise<{ orders: Order[]; pagination: Pagination }> => {
      return this.request('/orders', {
        params: {
          customer_id: customerId,
          page: options?.page,
          limit: options?.limit,
          status: options?.status,
        },
      });
    },

    get: async (orderId: string): Promise<{ order: OrderDetail }> => {
      return this.request(`/orders/${orderId}`);
    },

    create: async (data: {
      customer: { email: string; firstName: string; lastName: string; phone?: string };
      shippingAddress: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
      };
      items: {
        name: string;
        price: number;
        quantity: number;
        productId?: string;
        variantId?: string;
        sku?: string;
        image?: string;
      }[];
      payment: {
        provider: string;
        method: string;
        externalId?: string;
        amount: string | number;
        currency: string;
        status?: string;
        session_id?: string;
        captureID?: string;
        checkoutId?: string;
        orderId?: string;
        paymentLinkId?: string;
        txHash?: string;
        walletAddress?: string;
        chain?: string;
      };
      totals: { subtotal: number; discount: number; tax: number; shipping: number; total: number };
      discountCode?: unknown;
      metadata?: Record<string, unknown>;
    }): Promise<{ order: { id: string; orderNumber: string; status: string } }> => {
      return this.request('/orders', {
        method: 'POST',
        body: data,
      });
    },
  };

  // ============================================
  // Checkout
  // ============================================

  checkout = {
    create: async (data: {
      customerId: string;
      items: { variantId: string; quantity: number }[];
      shippingAddress: Omit<Address, 'id' | 'isDefault'>;
      billingAddress?: Omit<Address, 'id' | 'isDefault'>;
      customerNotes?: string;
      metadata?: Record<string, unknown>;
    }): Promise<{ order: Order & { items: unknown[] } }> => {
      return this.request('/checkout', {
        method: 'POST',
        body: data,
      });
    },
  };

  // ============================================
  // Payments
  // ============================================

  payments = {
    getMethods: async (): Promise<{
      methods: PaymentMethod[];
      currency: string;
      acceptedCurrencies: string[];
    }> => {
      const result = await this.request<{
        methods: PaymentMethod[];
        currency: string;
        acceptedCurrencies: string[];
      }>('/payments/methods');

      if (result.methods?.length) {
        return result;
      }

      const siteResult = await this.request<{ site: SiteSettings }>('/site');
      if (siteResult.site.payments?.methods?.length) {
        return siteResult.site.payments;
      }

      return result;
    },

    createPayPalOrder: async (data: {
      items: {
        variantId: string;
        quantity: number;
      }[];
      successUrl?: string;
      cancelUrl?: string;
      country: string;
      state?: string;
      discountCode?: string;
      customerEmail?: string;
      checkoutAttemptId?: string;
    }): Promise<{
      orderId: string;
      approveUrl: string;
      quote: {
        currency: string;
        subtotal: number;
        shippingAmount: number;
        discountAmount: number;
        total: number;
        items: Array<{
          variantId: string;
          productId: string;
          name: string;
          quantity: number;
          unitAmount: number;
        }>;
      };
    }> => {
      return this.request('/payments/paypal/checkout', {
        method: 'POST',
        body: data,
      });
    },

    capturePayPalOrder: async (
      orderId: string
    ): Promise<{
      captureId: string;
      status: string;
      payer: unknown;
      shippingAddress: unknown;
    }> => {
      return this.request('/payments/paypal/checkout', {
        method: 'POST',
        body: { orderId },
      });
    },
  };

  // ============================================
  // Discounts
  // ============================================

  discounts = {
    validate: async (
      code: string,
      subtotal?: number
    ): Promise<{ valid: boolean; discount: Discount }> => {
      return this.request('/discounts/validate', {
        method: 'POST',
        body: { code, subtotal },
      });
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
    getRates: async (data: {
      country: string;
      state?: string;
      weight?: number;
      subtotal?: number;
    }): Promise<{
      rates: ShippingRate[];
      freeShippingThreshold: number | null;
      freeShippingApplied: boolean;
    }> => {
      return this.request('/shipping/rates', {
        method: 'POST',
        body: data,
      });
    },
  };

  // ============================================
  // Wishlist
  // ============================================

  wishlist = {
    list: async (): Promise<{ wishlist: WishlistItem[] }> => {
      return this.request('/wishlist');
    },

    add: async (productId: string): Promise<{ success: boolean }> => {
      return this.request('/wishlist', {
        method: 'POST',
        body: { productId },
      });
    },

    remove: async (productId: string): Promise<{ success: boolean }> => {
      return this.request('/wishlist', {
        method: 'DELETE',
        params: { productId },
      });
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
      return this.request('/reviews', {
        params: {
          productId,
          page: options?.page,
          limit: options?.limit,
        },
      });
    },

    create: async (data: {
      productId: string;
      rating: number;
      title?: string;
      body?: string;
    }): Promise<{ review: Review; message: string }> => {
      return this.request('/reviews', {
        method: 'POST',
        body: data,
      });
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
      return this.request('/referrals', {
        method: 'POST',
        body: { email },
      });
    },

    validate: async (
      code: string,
      customerEmail?: string,
      orderTotal?: number
    ): Promise<{
      valid: boolean;
      error?: string;
      discount?: {
        code: string;
        type: string;
        value: number;
        amount: number;
        free_shipping: boolean;
        isReferral: boolean;
        referralId: string;
        referrerName: string;
        description: string;
      };
    }> => {
      return this.request('/referrals/validate', {
        method: 'POST',
        body: { code, customerEmail, orderTotal },
      });
    },

    apply: async (data: {
      referralId: string;
      orderId: string;
      orderTotal: number;
      discountApplied: number;
      referredEmail: string;
      referredName: string;
    }): Promise<{ success: boolean; referral?: unknown }> => {
      return this.request('/referrals/apply', {
        method: 'POST',
        body: data,
      });
    },

    get: async (email: string): Promise<{ referral: unknown | null }> => {
      return this.request('/referrals', {
        params: { email },
      });
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
