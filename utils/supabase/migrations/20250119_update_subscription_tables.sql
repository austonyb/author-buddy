-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS public.user_plans DROP CONSTRAINT IF EXISTS user_plans_plan_id_fkey;

-- Modify plans table to use UUID
ALTER TABLE public.plans 
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN id TYPE uuid USING (gen_random_uuid()),
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create checkouts table
CREATE TABLE IF NOT EXISTS public.checkouts (
    id uuid primary key,
    status text not null,
    user_id uuid not null references auth.users(id),
    product_id uuid not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Modify user_plans table to use UUID for plan_id
ALTER TABLE public.user_plans
    ALTER COLUMN plan_id TYPE uuid USING (gen_random_uuid());

-- Recreate foreign key constraint
ALTER TABLE public.user_plans 
    ADD CONSTRAINT user_plans_plan_id_fkey 
    FOREIGN KEY (plan_id) 
    REFERENCES public.plans(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON public.checkouts(user_id);

-- Enable RLS on checkouts
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow users to read their own checkouts" 
    ON public.checkouts FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Insert initial plan if not exists
INSERT INTO public.plans (name, description) 
VALUES ('Author Buddy Max', 'Premium plan with advanced features') 
ON CONFLICT (name) DO NOTHING;
