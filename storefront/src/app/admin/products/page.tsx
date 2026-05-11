'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser } from '@/lib/auth';
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

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  async function fetchProducts() {
    const token = getAccessToken();
    const user = getStoredUser();

    if (!token || user?.role !== 'ADMIN') {
      router.replace('/admin/login');
      return;
    }

    setIsCheckingAuth(false);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? 'Failed to fetch products');
      return;
    }

    setProducts(data);
  }

  async function handleRestoreProduct(productId: string) {
    const token = getAccessToken();

    if (!token) {
      setError('Please log in as admin.');
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/restore`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = res.headers.get('content-type');

    const data = contentType?.includes('application/json')
      ? await res.json()
      : { message: await res.text() };

    if (!res.ok) {
      setError(data.message ?? 'Failed to restore product');
      return;
    }

    await fetchProducts();
  }

  useEffect(() => {
    fetchProducts();
  }, []);
  
  if (isCheckingAuth) {
    return (
      <>
      <AdminNav />
      <main className="min-h-screen p-8">
        <p> Checking admin access... </p>
      </main>
      </>
    );
  }

  return (
    <>
    <AdminNav />
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Products</h1>
            <p className="mt-2 text-gray-600">
              Manage product catalog and inventory.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white"
          >
            Add product
          </Link>
        </div>

        {error && <p className="mt-6 text-red-600">{error}</p>}

        <div className="mt-8 overflow-hidden rounded-xl border">
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-gray-600">Name</th>
                <th className="p-4 text-gray-600">SKU</th>
                <th className="p-4 text-gray-600">Price</th>
                <th className="p-4 text-gray-600">Stock</th>
                <th className="p-4 text-gray-600">Status</th>
                <th className="p-4 text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={`border-t ${product.isActive ? '' : ' text-gray-500'}`}>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.sku}</td>
                  <td className="p-4">{formatPrice(product.priceCents)}</td>
                  <td className="p-4">{product.inventory?.quantity ?? 0}</td>
                  <td className="p-4">
                    {product.isActive ? (
                      <span className="rounded-full px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full px-3 py-1 text-xs font-medium text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {product.isActive && (
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                      )}

                      {!product.isActive && (
                        <button
                          onClick={() => handleRestoreProduct(product.id)}
                          className="rounded-lg border border-green-600 px-3 py-1 text-sm text-green-900 hover:bg-green-50"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-600" colSpan={6}>
                    No products found.
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
