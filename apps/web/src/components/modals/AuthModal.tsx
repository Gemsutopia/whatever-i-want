'use client';

import { IconX } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountCreatedSuccess } from '@/components/success-states';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';

// Product images for random selection
const gemImages = [
  '/images/products/gem.png',
  '/images/products/gem2.png',
  '/images/products/gem3.png',
  '/images/products/gem4.png',
  '/images/products/gem5.png',
  '/images/products/gem6.png',
  '/images/products/gem7.png',
  '/images/products/gem8.png',
  '/images/products/gem9.png',
  '/images/products/gem10.png',
  '/images/products/gem11.png',
];

interface AuthModalProps {
  mode: 'sign-up' | 'sign-in';
  onClose?: () => void;
  redirectTo?: string;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();
  const [randomImage, setRandomImage] = useState(gemImages[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
  });

  // Pick random image on mount
  useEffect(() => {
    setRandomImage(gemImages[Math.floor(Math.random() * gemImages.length)]);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signIn.email({
        email: formData.email,
      });
      if (result.error) toast.error(result.error.message || 'Failed to send sign-in link');
      else {
        setSuccessEmail(formData.email);
        setShowSuccess(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-black p-6 shadow-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 transition-colors hover:text-white"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
          <AccountCreatedSuccess email={successEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/60 transition-colors hover:text-white"
          aria-label="Close"
        >
          <IconX size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Form Side */}
          <div className="p-4 md:p-8">
            <div className="mb-4 md:mb-6 text-center">
              <h1 className="mb-2 font-[family-name:var(--font-bacasime)] text-2xl text-white md:text-3xl">
                Sign in to Gemsutopia
              </h1>
              <p className="text-sm text-white/60">
                We will email you a secure, one-time sign-in link. No password required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs text-white/70">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:py-2 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 md:mt-2 h-10 md:h-11 w-full rounded-lg bg-white font-[family-name:var(--font-inter)] text-sm text-black transition-all duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Sending secure link…' : 'Email me a sign-in link'}
              </Button>

              <p className="text-center text-xs text-white/30">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white/50">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-white/50">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>

          {/* Image Side */}
          <div className="relative hidden md:block">
            <Image src={randomImage} alt="Gemstone" fill className="object-cover" sizes="50vw" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
