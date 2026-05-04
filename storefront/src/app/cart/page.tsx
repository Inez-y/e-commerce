'use client';

import Link from 'next/link';
import { useCart } from '@/context/cart-context';

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function CartPage() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    totalCents,
    itemCount,
  } = useCart();

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

              <button className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-medium text-white">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
