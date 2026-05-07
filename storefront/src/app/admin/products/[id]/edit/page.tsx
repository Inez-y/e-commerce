'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';

type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  priceCents: number;
  isActive: boolean;
  inventory?: {
    quantity: number;
    reserved: number;
  } | null;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceCents, setPriceCents] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
      const contentType = res.headers.get('content-type');

      const data = contentType?.includes('application/json')
        ? await res.json() : { message: await res.text() };

      if (!res.ok) {
        setError(data.message ?? 'Failed to fetch product');
        return;
      }

      setProduct(data);
      setName(data.name);
      setDescription(data.description ?? '');
      setPriceCents(data.priceCents);
      setQuantity(data.inventory?.quantity ?? 0);
      setIsActive(data.isActive);
    }

    fetchProduct();
  }, [id]);

  async function handleUpdateProduct() {
    const token = getAccessToken();

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        priceCents,
        quantity,
        isActive,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? 'Failed to update product');
      return;
    }

    router.push('/admin/products');
  }

  async function handleSoftDelete() {
    const token = getAccessToken();

    if (!token) {
      router.push('/admin/login');
      return;
    }

    const confirmed = window.confirm('Soft-delete this product?');

    if (!confirmed) {
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? 'Failed to delete product');
      return;
    }

    router.push('/admin/products');
  }

  if (error) {
    return (
      <>
      <AdminNav />
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-xl">
          <p className="text-red-600">{error}</p>
          <Link href="/admin/products" className="mt-4 inline-block underline">
            Back to products
          </Link>
        </div>
      </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
      <AdminNav />
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-xl">
          <p>Loading product...</p>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
    <AdminNav />
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl">
        <Link href="/admin/products" className="text-sm text-gray-600 underline">
          ← Back to products
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Edit Product</h1>
        <p className="mt-2 text-gray-600">SKU: {product.sku}</p>

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

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <span>Active</span>
          </label>

          <button
            onClick={handleUpdateProduct}
            className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white"
          >
            Save Changes
          </button>

          <button
            onClick={handleSoftDelete}
            className="w-full rounded-xl border border-red-600 px-5 py-3 font-medium text-red-600"
          >
            Soft Delete
          </button>
        </div>
      </div>
    </main>
    </>
  );
}
