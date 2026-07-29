export interface UserIdentity {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
}

export interface UserIdentityWithEmail extends UserIdentity {
    email: string;
}

export type PresenceMemberIdentity = Pick<
    UserIdentity,
    'firstName' | 'lastName' | 'fullName'
>;
