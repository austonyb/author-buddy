import type { Product } from "@polar-sh/sdk/models/components";
import Link from "next/link";
import { polar } from "@/polar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";

async function getProducts(): Promise<Product[]> {
  const { result } = await polar.products.list({
    organizationId: process.env.POLAR_ORGANIZATION_ID!,
    isArchived: false, // Only fetch products which are published
  });

  return result.items;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const supabase = await createClient();
  const products = await getProducts();
  
  const { data: { session } } = await supabase.auth.getSession();
  const userEmail = session?.user?.email;
  
  const { data: currentSubscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .single();

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Choose your plan</h1>
        <p className="text-xl text-muted-foreground">
          Select a plan that best fits your needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isCurrentPlan={currentSubscription?.plan_id === product.id}
            userEmail={userEmail}
          />
        ))}
      </div>
    </div>
  );
}
