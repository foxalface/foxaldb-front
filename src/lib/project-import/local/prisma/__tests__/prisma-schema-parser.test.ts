import { describe, expect, it } from 'vitest';
import { parsePrismaSchemaDocument } from '../prisma-schema-parser';
import {
    compositePkSchema,
    compositeRelationSchema,
    defaultsSchema,
    enumSchema,
    implicitRelationSchema,
    mappedNamesSchema,
    multilineSchema,
    nativeTypesSchema,
    usersPostsSchema,
} from './fixtures/prisma-schemas';

describe('parsePrismaSchemaDocument', () => {
    it('parses users/posts models and explicit relation metadata', () => {
        const document = parsePrismaSchemaDocument(usersPostsSchema);

        expect(document.models.map((model) => model.name)).toEqual([
            'User',
            'Post',
        ]);

        const post = document.models.find((model) => model.name === 'Post');
        const relationField = post?.fields.find(
            (field) => field.name === 'author'
        );

        expect(relationField?.kind).toBe('object');
        expect(relationField?.attributes[0]?.name).toBe('@relation');
    });

    it('parses composite primary keys', () => {
        const document = parsePrismaSchemaDocument(compositePkSchema);
        const membership = document.models[0];

        expect(membership.blockAttributes[0]?.name).toBe('@@id');
    });

    it('parses @map and @@map', () => {
        const document = parsePrismaSchemaDocument(mappedNamesSchema);
        const model = document.models[0];
        const field = model.fields[0];

        expect(model.mapName).toBe('users');
        expect(
            field.attributes.find((attribute) => attribute.name === '@map')
        ).toBeDefined();
    });

    it('parses enums and enum map values', () => {
        const document = parsePrismaSchemaDocument(enumSchema);

        expect(document.enums[0].values).toEqual([
            { name: 'USER' },
            { name: 'ADMIN', mapValue: 'admin' },
        ]);
    });

    it('parses literal and generated defaults', () => {
        const document = parsePrismaSchemaDocument(defaultsSchema);
        const item = document.models[0];

        expect(
            item.fields.find((field) => field.name === 'label')?.attributes[0]
                ?.name
        ).toBe('@default');
        expect(
            item.fields.find((field) => field.name === 'token')?.attributes[0]
                ?.args[0]?.value
        ).toBe('uuid');
    });

    it('parses native @db attributes and multiline field attributes', () => {
        const document = parsePrismaSchemaDocument(nativeTypesSchema);
        const product = document.models[0];
        const code = product.fields.find((field) => field.name === 'code');

        expect(
            code?.attributes.some((attribute) => attribute.name === '@db.Char')
        ).toBe(true);

        const multiline = parsePrismaSchemaDocument(multilineSchema);
        const user = multiline.models[0];
        const email = user.fields.find((field) => field.name === 'email');

        expect(
            email?.attributes.some((attribute) => attribute.name === '@map')
        ).toBe(true);
    });

    it('classifies implicit relations as object navigation fields', () => {
        const document = parsePrismaSchemaDocument(implicitRelationSchema);
        const categories = document.models[0].fields.find(
            (field) => field.name === 'categories'
        );

        expect(categories?.kind).toBe('object');
        expect(categories?.list).toBe(true);
    });

    it('parses composite relation field lists', () => {
        const document = parsePrismaSchemaDocument(compositeRelationSchema);
        const tenantUser = document.models[0];
        const relation = tenantUser.fields.find(
            (field) => field.name === 'tenant'
        );

        expect(readRelationFields(relation)).toEqual(['tenantId', 'userId']);
        expect(readRelationReferences(relation)).toEqual(['tenantId', 'id']);
    });
});

const readRelationFields = (
    field:
        | {
              attributes: Array<{
                  name: string;
                  args: Array<{ name?: string; value: unknown }>;
              }>;
          }
        | undefined
): string[] => {
    const relation = field?.attributes.find(
        (attribute) => attribute.name === '@relation'
    );
    const named = relation?.args.find((arg) => arg.name === 'fields');

    return Array.isArray(named?.value)
        ? named.value.filter(
              (entry): entry is string => typeof entry === 'string'
          )
        : [];
};

const readRelationReferences = (
    field:
        | {
              attributes: Array<{
                  name: string;
                  args: Array<{ name?: string; value: unknown }>;
              }>;
          }
        | undefined
): string[] => {
    const relation = field?.attributes.find(
        (attribute) => attribute.name === '@relation'
    );
    const named = relation?.args.find((arg) => arg.name === 'references');

    return Array.isArray(named?.value)
        ? named.value.filter(
              (entry): entry is string => typeof entry === 'string'
          )
        : [];
};
