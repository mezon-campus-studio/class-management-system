import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/app/store';

export function AppProviders({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
