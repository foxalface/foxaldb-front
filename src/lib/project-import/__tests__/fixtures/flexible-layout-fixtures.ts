export const LARAVEL_CREATE_USERS_MIGRATION = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
`;

export const LARAVEL_CREATE_POSTS_MIGRATION = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
`;

export const GENERIC_PHP_FILE = `<?php

class Example
{
    public function run(): void
    {
        echo 'hello';
    }
}
`;

export const FLEXIBLE_PRISMA_SCHEMA = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

model Post {
  id     Int    @id @default(autoincrement())
  userId Int    @map("user_id")
  title  String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`;

export const INVALID_PRISMA_TEXT = `This is not a Prisma schema file.`;

export const FLEXIBLE_RAILS_SCHEMA = `ActiveRecord::Schema[8.0].define(version: 2026_01_01_000000) do
  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  add_foreign_key "posts", "users", column: "user_id", on_delete: :cascade
end`;

export const GENERIC_RUBY_FILE = `class Greeter
  def hello
    puts 'hi'
  end
end`;

export const FLEXIBLE_EF_SNAPSHOT = `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

namespace App.Migrations
{
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity("User", b =>
            {
                b.Property<int>("Id");
                b.HasKey("Id");
                b.ToTable("users");
            });
        }
    }
}`;

export const FLEXIBLE_EF_CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
  </ItemGroup>
</Project>`;

export const GENERIC_CSHARP_FILE = `namespace App;

public class Program
{
    public static void Main()
    {
    }
}`;

export const DJANGO_USERS_INITIAL = `from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('email', models.CharField(max_length=255, unique=True)),
            ],
        ),
    ]
`;

export const DJANGO_POSTS_INITIAL = `from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('author', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='users.user',
                )),
            ],
        ),
    ]
`;

export const DJANGO_USERS_ADD_BIO = `from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('imported', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='bio',
            field=models.TextField(blank=True, null=True),
        ),
    ]
`;

export const GENERIC_PYTHON_FILE = `def main() -> None:
    print('hello')
`;

export const FLEXIBLE_DRIZZLE_JOURNAL = JSON.stringify({
    version: '7',
    dialect: 'postgresql',
    entries: [
        {
            idx: 0,
            version: '7',
            when: 1,
            tag: '0000_initial',
            breakpoints: true,
        },
        {
            idx: 1,
            version: '7',
            when: 2,
            tag: '0001_add_posts',
            breakpoints: true,
        },
    ],
});

export const FLEXIBLE_DRIZZLE_INITIAL_SQL = `CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL
);

CREATE TABLE "posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "title" varchar(200) NOT NULL
);`;

export const FLEXIBLE_DRIZZLE_ADD_POSTS_SQL = `ALTER TABLE "posts" ADD COLUMN "published" boolean DEFAULT false;`;

export const FLEXIBLE_DRIZZLE_CONFIG = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
});
`;

export const CANONICAL_PRISMA_SCHEMA = FLEXIBLE_PRISMA_SCHEMA;
