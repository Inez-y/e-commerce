'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';

type Notification = {
  id: string;
  type: string;
  status: string;
  recipientEmail: string;
  subject: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
};

export default function AdminNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      const token = getAccessToken();
      const user = getStoredUser();

      if (!token || user?.role !== 'ADMIN') {
        router.push('/admin/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'Failed to fetch notifications');
        return;
      }

      setNotifications(data);
    }

    fetchNotifications();
  }, [router]);

  return (
    <>
    <AdminNav />
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Notifications</h1>
            <p className="mt-2 text-gray-600">
              Inspect notification job results.
            </p>
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
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Sent At</th>
                <th className="p-4">Error</th>
              </tr>
            </thead>

            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-t">
                  <td className="p-4">{notification.type}</td>
                  <td className="p-4">{notification.status}</td>
                  <td className="p-4">{notification.recipientEmail}</td>
                  <td className="p-4">{notification.subject}</td>
                  <td className="p-4">
                    {notification.sentAt
                      ? new Date(notification.sentAt).toLocaleString()
                      : '-'}
                  </td>
                  <td className="p-4">{notification.errorMessage ?? '-'}</td>
                </tr>
              ))}

              {notifications.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-600" colSpan={6}>
                    No notifications found.
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
