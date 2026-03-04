-- Add DELETE policy for user_profiles to allow users to delete their own profile data (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.user_profiles
FOR DELETE
USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));