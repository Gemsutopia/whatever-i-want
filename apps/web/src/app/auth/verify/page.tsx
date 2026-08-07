'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { verifySignInLink } from '@/lib/auth-client';

export default function VerifyCustomerSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('This sign-in link is incomplete. Request a new link.');
      return;
    }

    void verifySignInLink(token)
      .then(() => router.replace('/shop'))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'This sign-in link is no longer valid.');
      });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
        <h1 className="text-2xl">{error ? 'Sign-in link unavailable' : 'Signing you in…'}</h1>
        <p className="mt-3 text-sm text-white/60">
          {error ?? 'Verifying your secure Gemsutopia link. This should only take a moment.'}
        </p>
        {error ? (
          <Link
            className="mt-6 inline-block rounded-lg bg-white px-5 py-2 text-sm text-black"
            href="/sign-in"
          >
            Request a new link
          </Link>
        ) : null}
      </div>
    </main>
  );
}
