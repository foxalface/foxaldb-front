import { buildUserIdentity } from '@/lib/user';
import type { CommentAuthor } from '@/lib/comments/comment-types';

export const aliceAuthor: CommentAuthor = buildUserIdentity(
    1,
    'Alice',
    'Anderson'
);

export const bobAuthor: CommentAuthor = buildUserIdentity(2, 'Bob', 'Smith');

export const aliceWonderAuthor: CommentAuthor = buildUserIdentity(
    1,
    'Alice',
    'Wonder'
);

export const alexAuthor: CommentAuthor = buildUserIdentity(7, 'Alex', 'Renart');

export const aliceCommentAuthor: CommentAuthor = buildUserIdentity(
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
