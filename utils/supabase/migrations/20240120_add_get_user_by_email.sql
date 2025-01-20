-- Create a function to get a user by email efficiently
create or replace function auth.get_user_by_email(email text)
returns auth.users as $$
  select *
  from auth.users
  where lower(email) = lower($1)
  limit 1;
$$ language sql security definer;

-- Grant execute permission to the service role
grant execute on function auth.get_user_by_email(text) to service_role;
