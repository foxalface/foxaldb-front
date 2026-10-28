import { useContext } from 'react';
import { AuthIntentContext } from '@/context/auth-intent-context/auth-intent-context';

export const useAuthIntent = () => useContext(AuthIntentContext);
