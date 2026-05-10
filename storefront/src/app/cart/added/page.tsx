import Link from 'next/link';
import { StorefrontNav } from '@/components/storefront-nav';

type CartAddedPageProps = {
  searchParams: Promise<{
    productName?: string;
  }>;
};

export default async function CartAddedPage({
  searchParams,
}: CartAddedPageProps) {
  const { productName } = await searchParams;

  return (
    <>
    <StorefrontNav />
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl">
        <section className="rounded-2xl border p-8 text-center shadow-sm">
          <h1 className="mt-3 text-3xl font-bold text-green-700">
            Item added successfully
          </h1>

          <p className="mt-4 text-gray-600">
            {productName
              ? `${productName} was added to your cart.`
              : 'Your item was added to your cart.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cart"
              className="rounded-xl bg-green-950 px-5 py-3 font-medium text-white"
            >
              View cart
            </Link>

            <Link
              href="/"
              className="rounded-xl border px-5 py-3 font-medium text-white"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
