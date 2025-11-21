import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spark } from '@/components/ui/Spark';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden">
      {/* Decorative floating sparks */}
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
      <ClerkSignIn
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
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl={from}
      />
    </div>
  );
};

export default SignIn;
