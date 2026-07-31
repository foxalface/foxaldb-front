import { buildUserIdentity } from '@/lib/user';
import type { UserIdentity } from '@/lib/user/user-identity-types';

export const aliceAuthor: UserIdentity = buildUserIdentity(
    1,
    'Alice',
    'Anderson'
);

export const bobAuthor: UserIdentity = buildUserIdentity(2, 'Bob', 'Smith');

export const aliceWonderAuthor: UserIdentity = buildUserIdentity(
    1,
    'Alice',
    'Wonder'
);

export const alexAuthor: UserIdentity = buildUserIdentity(7, 'Alex', 'Renart');

export const aliceCommentAuthor: UserIdentity = buildUserIdentity(
    7,
    'Alice',
    'Martin'
);

export const testAuthAlice = () => ({
    id: 1,
    first_name: 'Alice',
    last_name: 'Anderson',
    full_name: 'Alice Anderson',
    email: 'a@example.com',
});

export const presenceIdentity = (firstName: string, lastName: string) => ({
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
});
