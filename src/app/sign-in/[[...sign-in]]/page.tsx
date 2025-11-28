// src/app/sign-in/[[...sign-in]]/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  useEffect(() => {
    // This will handle the redirect after successful sign-in
    const handleSignIn = () => {
      router.push(redirectUrl);
    };

    window.addEventListener('clerk:signin:success', handleSignIn);
    return () => {
      window.removeEventListener('clerk:signin:success', handleSignIn);
    };
  }, [redirectUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignIn 
        redirectUrl={redirectUrl}
        afterSignInUrl={redirectUrl}
        signUpUrl="/sign-in" // Disable sign-up by pointing to sign-in
      />
    </div>
  );
}