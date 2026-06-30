export const userPrivateChannel = (userId: number | string): string =>
    `user.${userId}`;

export const diagramPrivateChannel = (diagramId: number | string): string =>
    `diagram.${diagramId}`;

export const userPrivateChannelFull = (userId: number | string): string =>
    `private-user.${userId}`;

export const diagramPrivateChannelFull = (diagramId: number | string): string =>
    `private-diagram.${diagramId}`;

export const diagramPresenceChannelFull = (
    diagramId: number | string
): string => `presence-diagram.${diagramId}`;
