'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/marketplace/manage/listings');
  }, [router]);
  return null;
}
