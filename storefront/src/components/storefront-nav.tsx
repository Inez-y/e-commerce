'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';

type StoredUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
};

export function StorefrontNav() {
  const { itemCount, clearCart } = useCart();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');

    if (!rawUser) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(rawUser));
    } catch {
      setUser(null);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    clearCart();
    setUser(null);
    window.location.href = '/';
  }

  return (
    <nav className="border-b px-8 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          E-commerce 
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">
            Products
          </Link>

          <Link href="/cart" className="hover:underline">
            Cart ({itemCount})
          </Link>

          {user?.role === 'ADMIN' && (
            <Link href="/admin/products" className="hover:underline">
              Admin
            </Link>
          )}

          {!user ? (
            <Link
              href="/login"
              className="rounded-lg border px-3 py-1 font-medium"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-lg border px-3 py-1 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
