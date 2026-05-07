'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';

type Order = {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  user: {
    email: string;
  };
  items: {
    id: string;
    quantity: number;
  }[];
};

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      const token = getAccessToken();
      const user = getStoredUser();

      if (!token || user?.role !== 'ADMIN') {
        router.push('/admin/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'Failed to fetch orders');
        return;
      }

      setOrders(data);
    }

    fetchOrders();
  }, [router]);

  return (
    <>
    <AdminNav />
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Orders</h1>
            <p className="mt-2 text-gray-600">View customer orders.</p>
          </div>

          <Link href="/admin/products" className="text-sm underline">
            Products
          </Link>
        </div>

        {error && <p className="mt-6 text-red-600">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4 font-mono text-xs">{order.id}</td>
                  <td className="p-4">{order.user.email}</td>
                  <td className="p-4">{order.status}</td>
                  <td className="p-4">{order.items.length}</td>
                  <td className="p-4">{formatPrice(order.totalCents)}</td>
                  <td className="p-4">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-600" colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
    </>
  );
}
