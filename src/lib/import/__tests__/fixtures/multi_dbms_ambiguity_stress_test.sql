-- FoxalDB dialect detection stress fixture
-- PURPOSE: maximize contradictory dialect evidence so the importer can exercise
-- its ambiguity-resolution UI.
--
-- This file is intentionally NOT valid for any single database engine.
-- Do not execute it against a real database.

-- ---------------------------------------------------------------------------
-- PostgreSQL-family evidence
-- ---------------------------------------------------------------------------
-- PostgreSQL dump
SET statement_timeout = 0;

CREATE TABLE pg_example (
    id BIGSERIAL PRIMARY KEY,
    external_id UUID,
    payload JSONB
);

CREATE INDEX idx_pg_payload
ON pg_example USING GIN (payload);

-- ---------------------------------------------------------------------------
-- CockroachDB-specific evidence
-- ---------------------------------------------------------------------------
-- CockroachDB dump
SELECT * FROM crdb_internal.tables LIMIT 1;

-- ---------------------------------------------------------------------------
-- MySQL-family evidence
-- ---------------------------------------------------------------------------
CREATE TABLE `mysql_example` (
    id INTEGER NOT NULL AUTO_INCREMENT,
    status TINYINT NOT NULL DEFAULT 0,
    payload JSON,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- MariaDB-specific evidence
-- ---------------------------------------------------------------------------
-- MariaDB dump 10.19
CREATE TABLE `mariadb_example` (
    id INTEGER NOT NULL AUTO_INCREMENT,
    value MEDIUMINT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- SQL Server evidence
-- ---------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO

CREATE TABLE [dbo].[sqlserver_example] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    external_id UNIQUEIDENTIFIER,
    display_name NVARCHAR(255)
);
GO

-- ---------------------------------------------------------------------------
-- Oracle evidence
-- ---------------------------------------------------------------------------
CREATE TABLE oracle_example (
    id NUMBER(19) PRIMARY KEY,
    name VARCHAR2(255),
    body CLOB,
    created_at DATE DEFAULT SYSDATE
);

-- ---------------------------------------------------------------------------
-- SQLite evidence
-- ---------------------------------------------------------------------------
PRAGMA foreign_keys = ON;

CREATE TABLE sqlite_example (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- ClickHouse evidence
-- ---------------------------------------------------------------------------
-- Included intentionally to ensure the detector sees ClickHouse syntax too.
-- Since FoxalDB v1 has no ClickHouse SQL DDL importer, ClickHouse should not
-- become a valid DDL import candidate even though it is recognized.
CREATE TABLE clickhouse_example (
    id UInt64,
    name String
)
ENGINE = MergeTree
ORDER BY id;

-- ---------------------------------------------------------------------------
-- Generic SQL to avoid the fixture being only vendor markers
-- ---------------------------------------------------------------------------
CREATE TABLE generic_example (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP
);
