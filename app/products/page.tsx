import type { Product } from "@polar-sh/sdk/models/components";
import Link from "next/link";
import { useMemo } from "react";
import { polar } from "../../polar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface ProductCardProps {
  name: string;
  description: string | null;
  maxUsage: number | null;
  id: number;
  highlightPlan?: boolean;
  isCurrentPlan?: boolean;
}

export const ProductCard = ({ name, description, maxUsage, id, highlightPlan = false, isCurrentPlan = false }: ProductCardProps) => {
  return (
    <div className={`flex flex-col gap-y-6 justify-between p-8 rounded-lg border ${highlightPlan ? 'border-primary bg-primary/5' : 'bg-card border-border'} h-full`}>
      <div className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-semibold text-foreground">{name}</h2>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-col gap-y-2">
          <p className="text-sm text-muted-foreground">
            Up to {maxUsage} lookups per month
          </p>
        </div>
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
            href={`/checkout?priceId=${id}`}
          >
            Subscribe
          </Link>
        )}
        <span className="text-muted-foreground">$25/mo</span>
      </div>
    </div>
  );
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const supabase = await createClient();
  
  // Get all available plans
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('max_usage', { ascending: true });

  if (!plans) {
    return <div>No plans available</div>;
  }

  // Get current user's plan
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  let currentPlanId: number | null = null;
  if (userId) {
    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    currentPlanId = userPlan?.plan_id || null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <ProductCard
              key={plan.id}
              name={plan.name}
              description={plan.description}
              maxUsage={plan.max_usage}
              id={plan.id}
              highlightPlan={searchParams.plan === plan.id.toString()}
              isCurrentPlan={plan.id === currentPlanId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
