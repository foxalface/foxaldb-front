CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email STRING NOT NULL,
    display_name STRING
);

CREATE TABLE public.posts (
    id INT8 DEFAULT unique_rowid() PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    title STRING NOT NULL,
    published BOOL DEFAULT false
);
