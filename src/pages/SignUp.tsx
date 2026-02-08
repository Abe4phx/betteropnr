import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Spark } from '@/components/ui/Spark';
import { Button } from '@/components/ui/button';
import { enterGuest } from '@/lib/guest';

const SignUp = () => {
  const navigate = useNavigate();

  const handleGuest = () => {
    enterGuest();
    navigate("/generator", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden">
      {/* Decorative floating sparks */}
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

      <div className="flex flex-col items-center gap-4">
        <ClerkSignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-elegant rounded-3xl border-0',
              headerTitle: 'font-heading font-bold',
              headerSubtitle: 'text-muted-foreground',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 rounded-2xl transition-all duration-200 hover:scale-[1.02]',
              footerActionLink: 'text-primary hover:text-primary/80',
              formFieldInput: 'rounded-xl border-border focus:ring-secondary',
              formFieldLabel: 'text-foreground font-medium',
              identityPreviewEditButton: 'text-primary',
              otpCodeFieldInput: 'rounded-xl border-border',
            },
            layout: {
              logoPlacement: 'inside',
            },
            variables: {
              colorPrimary: '#FF6B6B',
              colorText: '#0F1222',
              colorBackground: '#FFFFFF',
              colorInputBackground: '#FFFFFF',
              colorInputText: '#0F1222',
              borderRadius: '1rem',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/generator"
        />

        {/* Guest button */}
        <Button
          variant="ghost"
          onClick={handleGuest}
          className="text-muted-foreground hover:text-foreground"
        >
          Continue as Guest
        </Button>

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Guest mode lets you generate openers. Create an account to save and sync.
        </p>
      </div>
    </div>
  );
};

export default SignUp;
