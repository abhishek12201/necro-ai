'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StatsDemoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
