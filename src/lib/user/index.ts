export {
    UNKNOWN_USER_DISPLAY_NAME,
    formatUserFullName,
} from './format-user-full-name';
export { UNKNOWN_USER_INITIALS, getUserInitials } from './get-user-initials';
export {
    buildUserIdentity,
    parsePresenceUserIdentityFromChannel,
    parseUserIdentityFromHttp,
    parseUserIdentityFromWebSocket,
    parseUserIdentityWithEmailFromHttp,
    userIdentityFromAuthUser,
    type UserIdentityHttpDto,
    type UserIdentityWebSocketDto,
    type UserIdentityWithEmailHttpDto,
} from './parse-user-identity';
export type {
    PresenceMemberIdentity,
    UserIdentity,
    UserIdentityWithEmail,
} from './user-identity-types';
