import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { Spark } from '@/components/ui/Spark';
import { Button } from '@/components/ui/button';
import { enterGuest } from '@/lib/guest';

const SignUp = () => {
  const { isLoaded, signIn } = useSignIn();
  const navigate = useNavigate();

  const handleGuest = () => {
    enterGuest();
    navigate('/generator', { replace: true });
  };

  const handleOAuth = async (strategy: 'oauth_apple' | 'oauth_google') => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/generator',
      });
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden">
      <Spark
        className="absolute top-24 right-16 pointer-events-none hidden md:block"
        animate="pulse"
        duration={5}
        size={30}
      />
      <Spark
        className="absolute bottom-28 left-20 pointer-events-none hidden md:block"
        animate="drift"
        duration={8}
        size={26}
      />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-elegant p-6 sm:p-8 flex flex-col items-center gap-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up with Apple or Google.
          </p>
        </div>

        <div className="w-full space-y-3">
          <Button
            type="button"
            onClick={() => handleOAuth('oauth_apple')}
            disabled={!isLoaded}
            className="w-full rounded-2xl h-12 text-base"
          >
            Continue with Apple
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth('oauth_google')}
            disabled={!isLoaded}
            className="w-full rounded-2xl h-12 text-base"
          >
            Continue with Google
          </Button>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>

        <Button
          variant="ghost"
          onClick={handleGuest}
          className="text-muted-foreground hover:text-foreground"
        >
          Continue as Guest
        </Button>

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Signing in is optional. You can continue as a guest.
        </p>
      </div>
    </div>
  );
};

export default SignUp;
