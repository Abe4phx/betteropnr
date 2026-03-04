// This hook is now deprecated - use useClerkSyncContext from contexts/ClerkSyncContext instead
// Keeping this file for backwards compatibility but it just re-exports the context hook

import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';

export const useClerkSync = () => {
  return useClerkSyncContext();
};
