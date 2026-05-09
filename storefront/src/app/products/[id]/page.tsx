import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';

type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  priceCents: number;
  inventory?: {
    quantity: number;
    reserved: number;
  } | null;
};

async function getProduct(id: string): Promise<Product> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing');
  }

  const res = await fetch(`${apiUrl}/products/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }

  return res.json();
}

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  const stock = product.inventory?.quantity ?? 0;
  const isOutOfStock = stock <= 0;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to products
          </Link>

          <Link href="/cart" className="text-sm text-gray-600 hover:underline">
            View cart
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-gray-500">SKU: {product.sku} </p>
              <h1 className="mt-2 text-3xl font-bold"> {product.name} </h1>
            </div>

            <p className="text-2xl font-semibold">
              {formatPrice(product.priceCents)}
            </p>
          </div>

          <p className="mt-6 text-gray-700">
            {product.description ?? 'No description available.'}
          </p>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-600"> Available stock </p>
            <p className="text-xl text-gray-600 font-semibold"> {stock} </p>
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              priceCents: product.priceCents,
            }}
            disabled={isOutOfStock}
          />
        </section>
      </div>
    </main>
  );
}
