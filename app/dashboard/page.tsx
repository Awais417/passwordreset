'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated } from '../../lib/api/auth';
import { useRouter } from 'next/navigation';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return <Dashboard />;
}

