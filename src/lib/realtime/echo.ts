import type Echo from 'laravel-echo';

let echoInstance: Echo<'reverb'> | null = null;

export const getEcho = (): Echo<'reverb'> | null => echoInstance;

export const setEchoInstance = (instance: Echo<'reverb'>): void => {
    echoInstance = instance;
};

export const clearEchoInstance = (): void => {
    echoInstance = null;
};
