export const postgresDistinctiveSql = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    profile JSONB NOT NULL
);
`;

export const postgresDumpSql = `
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
COPY public.users (id, name) FROM stdin;
`;

export const mysqlDistinctiveSql = `
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

export const mariadbDistinctiveSql = `
-- MariaDB dump 10.19
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB;
`;

export const sqlServerDistinctiveSql = `
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
CREATE TABLE [dbo].[users] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    external_id UNIQUEIDENTIFIER NOT NULL
);
`;

export const sqliteDistinctiveSql = `
PRAGMA foreign_keys=OFF;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
);
`;

export const oracleDistinctiveSql = `
CREATE TABLE users (
    id NUMBER(10) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    created_at DATE DEFAULT SYSDATE
) TABLESPACE users_ts;
`;

export const cockroachDistinctiveSql = `
-- CockroachDB dump
SELECT * FROM crdb_internal.tables;
CREATE TABLE users (id INT PRIMARY KEY);
`;

export const genericAmbiguousSql = `
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255)
);
`;

export const dbmlSample = `Table users {
  id int [pk]
  name varchar
}`;

export const metadataJsonSample = JSON.stringify({
    fk_info: [],
    pk_info: [],
    columns: [],
    indexes: [],
    tables: [],
    views: [],
    database_name: 'app_db',
    version: '1.0',
});

export const diagramJsonSample = JSON.stringify({
    id: 'diagram-1',
    name: 'Imported Diagram',
    databaseType: 'postgresql',
    tables: [],
    relationships: [],
});

export const ordinaryJsonSample = JSON.stringify({
    tables: [],
    relationships: [],
});

export const malformedContent = `{ not valid json or sql`;

export const randomText = `This is just some random text without structure.`;
