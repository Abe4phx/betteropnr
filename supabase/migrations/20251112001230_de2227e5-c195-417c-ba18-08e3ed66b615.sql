-- Create user_profiles table to store profile information
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  profile_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (clerk_user_id = (SELECT clerk_user_id FROM public.users WHERE clerk_user_id = clerk_user_id LIMIT 1));

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (clerk_user_id = (SELECT clerk_user_id FROM public.users WHERE clerk_user_id = clerk_user_id LIMIT 1));

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (clerk_user_id = (SELECT clerk_user_id FROM public.users WHERE clerk_user_id = clerk_user_id LIMIT 1));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);