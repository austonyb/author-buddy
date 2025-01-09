create table if not exists public.books (
    asin text primary key,
    author text not null,
    rating text,
    type text,
    title text not null,
    url text,
    price numeric(10,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for common queries
create index if not exists books_author_idx on public.books(author);
create index if not exists books_type_idx on public.books(type);

-- Enable Row Level Security (RLS)
alter table public.books enable row level security;

-- Create a policy that allows all authenticated users to read
create policy "Allow authenticated users to read books"
    on public.books for select
    to authenticated
    using (true);

-- Create a policy that allows service role to insert/update
create policy "Allow service role to insert/update books"
    on public.books for all
    to service_role
    using (true)
    with check (true);
