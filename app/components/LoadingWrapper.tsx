'use client';

import { useLoading } from '../contexts/LoadingContext';
import LoadingBar from './LoadingBar';

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading();

  return (
    <>
      <LoadingBar isLoading={isLoading} />
      {children}
    </>
  );
}
