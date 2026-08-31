export const QA_PRISMA_SCHEMA = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    BigInt @id @default(autoincrement())
  email String @unique @db.VarChar(255)
  posts Post[]

  @@map("users")
}

model Post {
  id     BigInt @id @default(autoincrement())
  userId BigInt @map("user_id")
  title  String @db.VarChar(200)

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@map("posts")
}`;
