-- Drop existing functions to clean up
drop function if exists get_auth_user_by_email(text);
drop function if exists get_auth_user_by_email(varchar);
drop function if exists get_auth_user_by_email_v2(varchar);

-- Function to safely get auth user by email
create function get_auth_user_by_email_v2(user_email varchar)
returns table (
    id uuid,
    email varchar(255)
)
language plpgsql
security definer
set search_path = public
as $$
declare
    found_user record;
begin
    select au.id::uuid, au.email::varchar(255)
    into found_user
    from auth.users au
    where lower(au.email) = lower(user_email)
    limit 1;

    if found_user is not null then
        return query select found_user.id, found_user.email;
    end if;
    
    return;
end;
$$;

-- Grant execute permission to authenticated and service role users
grant execute on function get_auth_user_by_email_v2(varchar) to authenticated;
grant execute on function get_auth_user_by_email_v2(varchar) to service_role;
