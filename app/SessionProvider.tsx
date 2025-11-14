'use client';

// This is the one and only file that needs 'use client' for the provider
import { SessionProvider } from 'next-auth/react';

export default function AppSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}