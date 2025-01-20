-- Create plans table
create table if not exists public.plans (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create checkouts table
create table if not exists public.checkouts (
    id uuid primary key,
    status text not null,
    user_id uuid not null references auth.users(id),
    product_id uuid not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_plans table
create table if not exists public.user_plans (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id),
    plan_id uuid not null references public.plans(id),
    start_date timestamp with time zone not null,
    end_date timestamp with time zone,
    cancellation_date timestamp with time zone,
    usage_tracking jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index if not exists idx_checkouts_user_id on public.checkouts(user_id);
create index if not exists idx_user_plans_user_id on public.user_plans(user_id);
create index if not exists idx_user_plans_active on public.user_plans(user_id) where end_date is null;

-- Insert initial plan
insert into public.plans (name, description) 
values ('Author Buddy Max', 'Premium plan with advanced features') 
on conflict (name) do nothing;
