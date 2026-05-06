'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser, logout } from '@/lib/auth';

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

    async function fetchProducts() {
        const token = getAccessToken();
        const user = getStoredUser();

        if (!token || user?.role !== 'ADMIN') {
            router.push('/admin/login');
            return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await.res.json();
        if (!res.ok) {
            setError(data.message ?? 'Failed to fetch products.');
            return;
        }

        setProducts(data);
    }

    useEffect(() => { fetchProducts()}, []);

    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between gap-4">
                    {/* 1. Title */}
                    <div>
                        <h1 className="test-3xl font-bold"> Admin Products </h1>
                        <p className="mt-2 text-gray-600">
                            Manage product catalog and inventory.
                        </p>
                    </div>

                    {/* 2. Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/products/new"
                            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
                            >
                                Add product
                        </Link>

                        <button
                            onClick={() => {
                                logout();
                                router.push('/admin/login');
                            }} 
                            className="rounded-xl border px-5 py-3 text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                { error && <p className="mt-6 text-red-600"> {error} </p> }

                <div className="mt-8 overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
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
                            <td className="p-4">
                                <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="text-sm underline"
                                >
                                Edit
                                </Link>
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
    )
}
