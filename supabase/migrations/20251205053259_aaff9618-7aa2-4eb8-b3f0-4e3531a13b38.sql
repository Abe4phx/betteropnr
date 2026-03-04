-- Add DELETE policy for users table (missing policy allows any authenticated user to delete any record)
CREATE POLICY "Users can delete own record"
ON public.users
FOR DELETE
USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));