import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context/auth-context';

export const useAuth = () => useContext(AuthContext);
