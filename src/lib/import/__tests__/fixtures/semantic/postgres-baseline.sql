CREATE SCHEMA IF NOT EXISTS audit;

CREATE TYPE public.mood AS ENUM ('happy', 'sad');

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit.users (
    id BIGINT PRIMARY KEY,
    email TEXT NOT NULL
);

CREATE TABLE public.posts (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    published BOOLEAN DEFAULT false,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES public.users (id)
        ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE VIEW public.active_users AS
SELECT id, email FROM public.users;

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES public.categories (id)
);

COMMENT ON COLUMN public.users.email IS 'login email';
