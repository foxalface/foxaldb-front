CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    display_name NVARCHAR(100) NULL,
    created_at DATETIME2 NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_users_email UNIQUE (email)
);

CREATE TABLE dbo.posts (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    published BIT NOT NULL DEFAULT 0,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES dbo.users (id)
        ON DELETE CASCADE
);

CREATE VIEW dbo.active_users AS
SELECT id, email FROM dbo.users;
