/**
 * Narrow Echo private-channel surface used by diagram realtime subscribers.
 * Matches ChannelManager's PrivateChannel listen / stopListening API.
 */
export interface DiagramPrivateEventChannel {
    listen(
        event: string,
        callback: (payload: unknown) => void
    ): DiagramPrivateEventChannel;
    stopListening(
        event: string,
        callback?: (payload: unknown) => void
    ): DiagramPrivateEventChannel;
}
