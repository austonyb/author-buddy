-- Create checkouts table
CREATE TABLE IF NOT EXISTS public.checkouts (
    id uuid primary key,
    status text not null,
    user_id uuid not null references auth.users(id),
    product_id text not null, -- Store Polar's product ID as text
    plan_id bigint references public.plans(id), -- Reference our internal plan ID
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON public.checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_plan_id ON public.checkouts(plan_id);

-- Enable RLS on checkouts
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow users to read their own checkouts" 
    ON public.checkouts FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);
