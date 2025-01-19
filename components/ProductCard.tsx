import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@polar-sh/sdk/models/components";

interface PolarProductCardProps {
    product: Product
}

export const PolarProductCard = ({ product }: PolarProductCardProps) => {
    // Handling just a single price for now
    // Remember to handle multiple prices for products if you support monthly & yearly pricing plans
    const firstPrice = product.prices[0]

    const price = useMemo(() => {
        switch(firstPrice.amountType) {
            case 'fixed':
                // The Polar API returns prices in cents - Convert to dollars for display
                return `$${firstPrice.priceAmount / 100}`
            case 'free':
                return 'Free'
            default:
                return 'Pay what you want'
        }
    }, [firstPrice])

    return (
        <div className="flex flex-col gap-y-24 justify-between p-12 rounded-3xl bg-neutral-950 h-full border border-neutral-900">
            <div className="flex flex-col gap-y-8">
            <h1 className="text-3xl">{product.name}</h1>
            <p className="text-neutral-400">{product.description}</p>
            <ul>
                {product.benefits.map((benefit) => (
                    <li key={benefit.id} className="flex flex-row gap-x-2 items-center">
                        {benefit.description}
                    </li>
                ))}
            </ul>
           </div>
            <div className="flex flex-row gap-x-4 justify-between items-center">
                <Link className="h-8 flex flex-row items-center justify-center rounded-full bg-white text-black font-medium px-4" href={`/checkout?productId=${product.id}`}>Buy</Link>
                <span className="text-neutral-500">{price}</span>
            </div>
        </div>
    )
}

interface ProductCardProps {
    product: Product;
    isCurrentPlan?: boolean;
}

export const ProductCard = ({ product, isCurrentPlan = false }: ProductCardProps) => {
    const firstPrice = product.prices[0];

    const price = useMemo(() => {
        if (!firstPrice) return 'Contact us';
        
        switch(firstPrice.amountType) {
            case 'fixed':
                return `$${firstPrice.priceAmount / 100}/mo`;
            case 'free':
                return 'Free';
            default:
                return 'Pay what you want';
        }
    }, [firstPrice]);

    return (
        <div className="flex flex-col gap-y-6 justify-between p-8 rounded-lg border bg-card border-border h-full">
            <div className="flex flex-col gap-y-4">
                <h2 className="text-2xl font-semibold text-foreground">{product.name}</h2>
                <p className="text-muted-foreground">{product.description}</p>
                <ul className="flex flex-col gap-y-2">
                    {product.benefits.map((benefit) => (
                        <li key={benefit.id} className="text-sm text-muted-foreground flex flex-row gap-x-2 items-center">
                            {benefit.description}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-row gap-x-4 justify-between items-center">
                {isCurrentPlan ? (
                    <button 
                        disabled
                        className="h-10 px-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium cursor-not-allowed"
                    >
                        Subscribed
                    </button>
                ) : (
                    <Link
                        className="h-10 px-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        href={`/checkout?productId=${product.id}`}
                    >
                        Subscribe
                    </Link>
                )}
                <span className="text-muted-foreground">{price}</span>
            </div>
        </div>
    );
};