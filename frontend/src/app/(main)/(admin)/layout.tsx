'use client';

import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '~store/rootReducer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminPath = pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  if (isAdmin && isAdminPath) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 pt-16 lg:pt-0 lg:pl-[var(--admin-sidebar-width,256px)] transition-[padding-left] duration-300">
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    );
  }

  return <>{children}</>;
}
