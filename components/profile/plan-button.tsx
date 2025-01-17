'use client';

import { useRouter } from 'next/navigation';

interface PlanButtonProps {
  planId?: number;
  label: string;
  className?: string;
}

export function PlanButton({ planId, label, className = '' }: PlanButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(planId ? `/products?plan=${planId}` : '/products');
  };

  return (
    <button 
      className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors ${className}`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
