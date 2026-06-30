import { useContext } from 'react';
import { RealtimeContext } from '@/context/realtime-context/realtime-context';

export const useRealtime = () => useContext(RealtimeContext);
