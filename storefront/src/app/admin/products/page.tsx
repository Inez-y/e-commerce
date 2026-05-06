'use client';

import { useEffect, useState } from 'react';

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

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  async function fetchProducts() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? 'Failed to fetch products');
      return;
    }

    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Products</h1>
            <p className="mt-2 text-gray-600">
              Manage product catalog and inventory.
            </p>
          </div>

          <a
            href="/admin/products/new"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Add product
          </a>
        </div>

        {error && <p className="mt-6 text-red-600">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.sku}</td>
                  <td className="p-4">{formatPrice(product.priceCents)}</td>
                  <td className="p-4">{product.inventory?.quantity ?? 0}</td>
                  <td className="p-4">
                    {product.isActive ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
