'use client';

import { useCart } from '@/context/cart-context';

type AddToCartButtonProps = {
    product: {
        id: string;
        name: string;
        priceCents: number;
    };
    disabled?: boolean;
};

export function AddToCartButton({
    product,
    disabled = false,
}: AddToCartButtonProps) {
    const { addItem } = useCart();

    return (
        <button
            disabled={disabled}
            onClick={() =>
                addItem({
                    productId: product.id,
                    name: product.name,
                    priceCents: product.priceCents,
                })
            }
            className="mt-8 w-full rounded-xl bg-black px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {disabled ? 'Out of stock' : 'Add to cart'}
        </button>
    );
}
