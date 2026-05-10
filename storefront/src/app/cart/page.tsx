'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function CartPage() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    totalCents,
    itemCount,
  } = useCart();

  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  async function handleCheckout() {
    const token = localStorage.getItem('accessToken');

  if (!token) {
    console.log('[Cart] Login needed.');
    setShowLoginModal(true);
    return;
  }

    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await res.json();
      if (!res.ok) {
      alert(data.message ?? 'Checkout failed');
      return;
    }

    clearCart();
    
    router.push(`/orders/${data.id}`);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Continue shopping
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Cart</h1>

        {items.length === 0 ? (
          <p className="mt-8 text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="rounded-xl border p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.priceCents)} each
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.productId)}
                    className="rounded border px-3 py-1"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.productId)}
                    className="rounded border px-3 py-1"
                  >
                    +
                  </button>

                  <span className="ml-auto font-medium">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
              </div>
            ))}

            <div className="rounded-xl border p-5">
              <div className="flex justify-between">
                <span>Total items</span>
                <span>{itemCount}</span>
              </div>

              <div className="mt-2 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(totalCents)}</span>
              </div>

              <button
                data-testid="checkout-button"
                onClick={handleCheckout}
                className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3 font-medium text-white"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl text-black font-bold">Login required</h2>

            <p className="mt-3 text-gray-600">
              Please log in before checkout. Your cart will be saved.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 rounded-xl border px-4 py-2 text-gray-600 font-medium"
              >
                Stay here
              </button>

              <button
                onClick={() => router.push('/login')}
                className="flex-1 rounded-xl bg-black px-4 py-2 font-medium text-white"
              >
                Continue to login
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
