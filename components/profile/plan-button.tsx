'use client';

import { useRouter } from 'next/navigation';

interface PlanButtonProps {
  planId?: number;
  label: string;
  className?: string;
  currentPlanId?: number;
  maxUsage?: number;
  currentPlanMaxUsage?: number;
}

export function PlanButton({ 
  planId, 
  label, 
  className = '', 
  currentPlanId,
  maxUsage,
  currentPlanMaxUsage 
}: PlanButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(planId ? `/products?plan=${planId}` : '/products');
  };

  // Determine if this is an upgrade or downgrade button
  const getActionLabel = () => {
    if (!currentPlanId || !maxUsage || !currentPlanMaxUsage) return label;
    
    if (planId === currentPlanId) return 'Current Plan';
    if (maxUsage > currentPlanMaxUsage) return `${label} (Upgrade)`;
    return `${label} (Downgrade)`;
  };

  return (
    <button 
      className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors ${className}`}
      onClick={handleClick}
    >
      {getActionLabel()}
    </button>
  );
}
