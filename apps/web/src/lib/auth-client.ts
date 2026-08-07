import { useEffect, useState } from 'react';
import { store } from './store';

type CustomerUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

type CustomerSession = { user: CustomerUser | null; token: string | null };

const TOKEN_KEY = 'customerToken';
const USER_KEY = 'customerUser';
const PENDING_EMAIL_KEY = 'customerPendingEmail';

let currentSession: CustomerSession = { user: null, token: null };
const listeners = new Set<(session: CustomerSession) => void>();

const notifyListeners = () => listeners.forEach((listener) => listener(currentSession));

if (typeof window !== 'undefined') {
  const token = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);
  if (token && savedUser) {
    try {
      currentSession = { token, user: JSON.parse(savedUser) as CustomerUser };
      store.setCustomerToken(token);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
}

function saveSession(user: CustomerUser | null, token: string | null) {
  currentSession = { user, token };
  if (typeof window !== 'undefined') {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
  store.setCustomerToken(token);
  notifyListeners();
}

async function requestSignInLink(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const callbackUrl =
    typeof window === 'undefined' ? undefined : `${window.location.origin}/auth/verify`;
  await store.auth.requestSignInLink(normalizedEmail, callbackUrl);
  if (typeof window !== 'undefined') localStorage.setItem(PENDING_EMAIL_KEY, normalizedEmail);
  return { data: { sent: true }, error: null };
}

export const signUp = {
  email: async (data: { email: string; password?: string; name?: string }) => {
    try {
      return await requestSignInLink(data.email);
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Failed to send sign-in link' },
      };
    }
  },
};

export const signIn = {
  email: async (data: { email: string; password?: string }) => {
    try {
      return await requestSignInLink(data.email);
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Failed to send sign-in link' },
      };
    }
  },
};

export async function verifySignInLink(token: string) {
  const verified = await store.auth.verifySignInLink(token);
  const profile = await store.auth.getProfile();
  const pendingEmail =
    typeof window !== 'undefined' ? localStorage.getItem(PENDING_EMAIL_KEY) : null;
  const email = profile.user.email || pendingEmail || 'customer';
  const user: CustomerUser = {
    id: profile.user.id,
    email,
    name: email.includes('@') ? email.split('@')[0] : 'Customer',
    image: null,
  };
  saveSession(user, verified.token);
  if (typeof window !== 'undefined') localStorage.removeItem(PENDING_EMAIL_KEY);
  return user;
}

export const signOut = async () => {
  try {
    await store.auth.logout();
  } finally {
    saveSession(null, null);
  }
  return { error: null };
};

/**
 * Send a signed-in shopper to their account portal without a second sign-in.
 *
 * 🔴 The session token stays here. What travels is a one-use ticket, valid for
 * about a minute, which the portal trades for a session of its own. Putting
 * `customerToken` in this URL would be the whole vulnerability: it would land in
 * browser history, in any `Referer` the portal's next navigation sends, and in
 * every proxy log between here and there — and unlike the ticket, it would still
 * work tomorrow.
 *
 * Falls back to the portal's ordinary sign-in page rather than failing loudly: a
 * shopper clicking "My account" should always arrive somewhere useful, and the
 * emailed-link flow there is the same one they already know.
 */
export async function openCustomerPortal() {
  const portalUrl = process.env.NEXT_PUBLIC_QUICKDASH_PORTAL_URL;
  const portalSlug = process.env.NEXT_PUBLIC_QUICKDASH_PORTAL_SLUG;
  if (!portalUrl || !portalSlug) {
    return { error: { message: 'No customer portal is configured for this store.' } };
  }

  const base = `${portalUrl.replace(/\/$/, '')}/${portalSlug}`;

  if (!currentSession.token) {
    window.location.href = base;
    return { error: null };
  }

  try {
    const { token } = await store.auth.requestPortalHandoff();
    const target = new URL(`${base}/handoff`);
    target.searchParams.set('token', token);
    window.location.href = target.toString();
  } catch {
    window.location.href = base;
  }
  return { error: null };
}

export const changePassword = async () => ({
  data: null,
  error: { message: 'Gemsutopia uses secure email sign-in links instead of passwords.' },
});

export const deleteAccount = async () => ({
  data: null,
  error: { message: 'Contact Gemsutopia support to delete your customer account.' },
});

export const getSession = async () => {
  if (!currentSession.token || !currentSession.user) return { data: null };
  try {
    await store.auth.getProfile();
    return { data: { session: currentSession, user: currentSession.user } };
  } catch {
    saveSession(null, null);
    return { data: null };
  }
};

export function useSession() {
  const [session, setSession] = useState(currentSession);

  useEffect(() => {
    listeners.add(setSession);
    return () => {
      listeners.delete(setSession);
    };
  }, []);

  return {
    data: session.user ? { session, user: session.user } : null,
    isPending: false,
    error: null,
  };
}

export const authClient = {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  changePassword,
  deleteAccount,
  verifySignInLink,
  openCustomerPortal,
};
