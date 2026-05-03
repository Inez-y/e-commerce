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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {cache: 'no-cache'});

  if (!res.ok) {
    throw new Error('[Front] Failed to fetch products.');
  }

  return res.json();
};