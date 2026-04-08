'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated) return null; // Show nothing or a loading spinner until storage is loaded
  if (!user || user.role !== 'admin') return null;


  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>

    </div>

  );
}
