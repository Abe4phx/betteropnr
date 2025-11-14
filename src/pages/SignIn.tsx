import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
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
        afterSignInUrl="/dashboard"
      />
    </div>
  );
};

export default SignIn;
