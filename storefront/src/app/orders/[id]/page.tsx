'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

type order = {
    id: string;
    status: string;
    totalCents: number;
    items: {
        id: string;
        quantity: number;
        unitPriceCents: number;
        subtotalCents: number;
        product: {
            id: string;
            name: string;
            sku: string;
        };
    }[];
};

    
function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function OrderConfirmationPage({
    params,
    } : { params: Promise<{ id: string}>; 
}) {
    const [order, setOrder] = useState<order | null>(null);
    const [error, setError] = useState('');

    const { id } = use(params);

    useEffect(()=>{
        async function fetchOrder() {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError(`Please log in to view this order.`);
                console.log('[Orders] Invalide access without a valid token.');
                return;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) {
                setError(data.message ?? 'Failed to fetch order');
                console.log('[Orders] Cannot fetch an order.')
                return;
            }

            setOrder(data);
        }

        fetchOrder();
    }, [id]);

    if (error) {
        console.log('[Orders] Error occured.');

        return(
            <main className="min-h-screen p-8">
                <div className="mx-auto max-w-3xl">
                <p className="text-red-600">{error}</p>
                <Link href="/" className="mt-4 inline-block underline">
                    Back to products
                </Link>
                </div>
            </main>
        );
    }

    if (!order) {
        console.log('[Orders] Loading order...');

        return (
            <main className="min-h-screen p-8">
                <div className="mx-auto max-w-3xl">
                <p>Loading order...</p>
                </div>
            </main>
        );
    }

    console.log('[Orders] Order confirmed.')
    return (
        <main className="min-h-screen p-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold"> Order confirmed </h1>

                <p className="mt-2 text-gray-600"> Order ID: {order.id} </p>
                <p className="mt-1 text-gray-600"> Status: {order.status} </p>

                {/* First div: iteam details */}
                <div className="mt-8 space-y-4">
                    {order.items.map((item) => (
                        <div key={item.id} className="rounded-xl border p-5">
                        <h2 className="font-semibold"> { item.product.name} </h2>
                        <p className="text-sm text-gray-600"> SKU: { item.product.sku } </p>
                        <p className="mt-2 text-sm"> Price: { formatPrice(item.unitPriceCents) } </p>
                        <p className="text-sm"> Quantity:  { item.quantity } </p>
                        <p className="font-medium"> Item total: { formatPrice(item.subtotalCents) } </p>
                        </div>
                    ))}
                </div>

                {/* Second div: Total */}
                <div className="mt-8 rounded-xl border p-5">
                    <div className="flex justify-between text-xl font-bold">
                        <span> Total </span>
                        <span>{ formatPrice(order.totalCents)} </span>
                    </div>
                </div>

                <Link
                    href="/"
                    className="mt-8 inline-block rounded-xl bg-gray-800 px-5 py-3 text-white"
                    >
                    Continue shopping
                </Link>
            </div>
        </main>
    );
}
