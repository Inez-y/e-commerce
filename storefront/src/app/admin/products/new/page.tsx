// Product creation
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [priceCents, setPriceCents] = useState(2500);
  const [quantity, setQuantity] = useState(10);
  const [error, setError] = useState('');

  async function handleCreateProduct() {
    console.log('[Admin: add product] Clicked the create product button.');
    const token = getAccessToken();

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        sku,
        priceCents,
        quantity,
      }),
    });

    const contentType = res.headers.get('content-type');

    const data = contentType?.includes('application/json')
      ? await res.json()
      : { message: await res.text() };

    if (!res.ok) {
      setError(data.message ?? 'Failed to create product');
      return;
    }

    if (!res.ok) {
      setError(data.message ?? 'Failed to create product');
      return;
    }

    console.log('[Admin: add product] A product has been created successfully.');
    router.push('/admin/products');
  }

  return (
    <>
    <AdminNav />
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl">
        <Link href="/admin/products" className="text-sm text-gray-600 underline">
          ← Back to products
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Add Product</h1>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">SKU</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Price cents</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              type="number"
              value={priceCents}
              onChange={(event) => setPriceCents(Number(event.target.value))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Quantity</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleCreateProduct}
            className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white"
          >
            Create Product
          </button>
        </div>
      </div>
    </main>
    </>
  );
}
