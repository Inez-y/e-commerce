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

async function getProducts(): Promise<Product[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing. Check storefront/.env.local');
  }

  const url = `${apiUrl}/products`;
  console.log('[Storefront] Fetching:', url);

  const res = await fetch(url, {
    cache: 'no-store',
  });
  console.log('[Storefront] Status:', res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error('[Storefront] Error response:', text);
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  const data = await res.json();
  console.log('[Storefront] Products response is array:', Array.isArray(data));
  console.log('[Storefront] Products count:', Array.isArray(data) ? data.length : 'not array');

  return data;
};

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
};

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen p-8">
      {/* 1. The main div */}
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold"> Storefront </h1>
        <p className="mt-2 text-gray-600">
          Browse available products from the e-commerce API.
        </p>

        {/* 1-1. Products */}
        {products.length === 0 ? ( <p className="mt-8 text-gray-600">No products found.</p> 
        ) : ( 
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border p-5 shadow-sm"
              >

                <h2 className="text-xl font-seminold"> {product.name} </h2>

                <p className="mt-4 font-medium"> {formatPrice(product.priceCents)} </p>

                <p className="mt-1 text-sm text-gray-500"> Stock: {product.inventory?.quantity ?? 0} </p>

                <a
                  href={`/products/${product.id}`}
                  className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white">
                  View product
                </a>
            </div>
          ))};
        </div>
        )}
      </div>
    </main>
  );
}
