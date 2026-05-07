'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export function AdminNav() {
  const router = useRouter();

  return (
    <nav className="border-b px-8 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/admin/products" className="font-bold">
          Admin Dashboard
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/products" className="hover:underline">
            Products
          </Link>

          <Link href="/admin/orders" className="hover:underline">
            Orders
          </Link>

          <Link href="/admin/notifications" className="hover:underline">
            Notifications
          </Link>

          <Link href="/admin/audit-logs" className="hover:underline">
            Audit Logs
          </Link>

          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="rounded-lg border px-3 py-1"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
