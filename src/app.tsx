import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TooltipProvider } from './components/tooltip/tooltip';
import { HelmetData } from './helmet/helmet-data';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/auth-context/auth-provider';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { RealtimeProvider } from '@/context/realtime-context/realtime-provider';

export const App = () => {
    return (
        <HelmetProvider>
            <AuthProvider>
                <AuthIntentProvider>
                    <RealtimeProvider>
                        <HelmetData />
                        <TooltipProvider>
                            <RouterProvider router={router} />
                        </TooltipProvider>
                    </RealtimeProvider>
                </AuthIntentProvider>
            </AuthProvider>
        </HelmetProvider>
    );
};
