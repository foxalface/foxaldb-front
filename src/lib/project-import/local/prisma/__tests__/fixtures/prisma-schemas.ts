export const usersPostsSchema = `
datasource db {
  provider = "postgresql"
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
`;

export const compositePkSchema = `
model Membership {
  tenantId Int
  userId   Int
  role     String
  @@id([tenantId, userId])
}
`;

export const mappedNamesSchema = `
model UserProfile {
  emailAddress String @map("email_address")
  @@map("users")
}
`;

export const enumSchema = `
enum Role {
  USER
  ADMIN @map("admin")
}

model Account {
  id   Int  @id
  role Role
}
`;

export const defaultsSchema = `
model Item {
  id        Int      @id @default(autoincrement())
  label     String   @default("draft")
  active    Boolean  @default(true)
  quantity  Int      @default(0)
  price     Decimal  @default(1.5)
  createdAt DateTime @default(now())
  token     String   @default(uuid())
}
`;

export const compositeRelationSchema = `
model TenantUser {
  tenantId Int
  userId   Int
  tenant   Tenant @relation(fields: [tenantId, userId], references: [tenantId, id])
  @@id([tenantId, userId])
}

model Tenant {
  tenantId Int @id
  id       Int
  users    TenantUser[]
}
`;

export const nativeTypesSchema = `
model Product {
  id   Int    @id
  code String @db.Char(2)
  slug String @db.VarChar(255)
  body String @db.Text
  data Json
  blob Bytes
}
`;

export const datasourceMismatchSchema = `
datasource db {
  provider = "postgresql"
}

model User {
  id Int @id
}
`;

export const implicitRelationSchema = `
model Post {
  id         Int        @id
  categories Category[]
}

model Category {
  id    Int    @id
  posts Post[]
}
`;

export const malformedSchema = `model Broken {
  id Int @id
  name String
`;

export const multilineSchema = `
model User {
  /// Account email
  id Int @id

  email String @unique @map(
    "email_address"
  )
}
`;

export const sentinelSchema = (sentinel: string): string => `
model Secret {
  id Int @id
  note String @default("${sentinel}")
}
`;
