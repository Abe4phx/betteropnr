import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Spark } from '@/components/ui/Spark';
import { Button } from '@/components/ui/button';
import { enterGuest } from '@/lib/guest';

const SignIn = () => {
  const { isLoaded, signIn } = useSignIn();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/generator';

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
        redirectUrlComplete: from,
      });
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden">
      <Spark
        className="absolute top-20 right-20 pointer-events-none hidden md:block"
        animate="drift"
        duration={6}
        size={32}
      />
      <Spark
        className="absolute bottom-32 left-24 pointer-events-none hidden md:block"
        animate="float"
        duration={7}
        size={28}
      />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-elegant p-6 sm:p-8 flex flex-col items-center gap-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Sign in to BetterOpnr</h1>
          <p className="text-sm text-muted-foreground">
            Start better conversations with Apple or Google.
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
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className="text-primary font-medium hover:underline">
            Create one
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

export default SignIn;
