-- Enable RLS on user_plans table
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own plans
CREATE POLICY "Users can view their own plans"
    ON public.user_plans
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for users to update their own plans
CREATE POLICY "Users can update their own plans"
    ON public.user_plans
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for service role to manage all plans
CREATE POLICY "Service role can manage all plans"
    ON public.user_plans
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.user_plans TO service_role;
GRANT SELECT, UPDATE ON public.user_plans TO authenticated;
