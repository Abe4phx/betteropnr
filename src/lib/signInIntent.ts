import { type NavigateFunction } from 'react-router-dom';
import { exitGuest } from '@/lib/guest';

export type SignInIntentSource =
  | 'navigation_sign_in'
  | 'navigation_sign_out'
  | 'profile_upload_sign_in'
  | 'profile_guest_callout_sign_in'
  | 'profile_premium_sign_in'
  | 'generator_save_and_navigate';

type SignInIntentOptions = {
  source: SignInIntentSource;
  replace?: boolean;
}

// Use this instead of navigate('/sign-in') from any user-click handler.
// Calling exitGuest() first makes isGuest() return false, which causes
// the history blocker in main.tsx to allow the navigation through naturally.
// Never call this from an automated/side-effect path — only from onClick handlers.
export function intentionalNavigateToSignIn(
  navigate: NavigateFunction,
  options: SignInIntentOptions,
): void {
  const { source, replace = false } = options;
  const pathname = window.location.pathname;

  console.error('[intentionalNavigateToSignIn] CALLED', {
    source,
    replace,
    pathname,
    stack: new Error().stack,
  });

  exitGuest();
  navigate('/sign-in', replace ? { replace: true } : undefined);
}
