DROP TABLE reservation;

DROP TABLE equipment;

DROP TABLE place;

DROP TABLE "user_session";

DROP TABLE "user";

-- https://github.com/Jakeii/nanoid-postgres
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 21)
    RETURNS text
    AS $$
DECLARE
    id text := '';
    i int := 0;
    urlAlphabet char(62) := 'ModuleSymbhasOwnPr0123456789ABCDEFGHNRVfgctiUvzKqYTJkLxpZXIjQW';
    bytes bytea := gen_random_bytes(size);
    byte int;
    pos int;
BEGIN
    WHILE i < size LOOP
        byte := get_byte(bytes, i);
        pos :=(byte & 60) + 1;
        -- + 1 because substr starts at 1 for some reason
        id := id || substr(urlAlphabet, pos, 1);
        i = i + 1;
    END LOOP;
    RETURN id;
END
$$
LANGUAGE PLPGSQL
STABLE;

CREATE TABLE "user"(
    id text PRIMARY KEY DEFAULT (concat('U', nanoid())),
    name text NOT NULL,
    email text NOT NULL
);

CREATE TABLE "user_session"(
    session_id text PRIMARY KEY DEFAULT (concat('S', nanoid())),
    "user" text NOT NULL REFERENCES "user"(id),
    timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE place(
    id text PRIMARY KEY DEFAULT (concat('P', nanoid())),
    name text NOT NULL,
    description text
);

CREATE TABLE equipment(
    id text PRIMARY KEY DEFAULT (concat('E', nanoid())),
    name text NOT NULL,
    description text NOT NULL,
    place text REFERENCES place(id)
);

CREATE TABLE reservation(
    id text PRIMARY KEY DEFAULT (concat('R', nanoid())),
    "user" text NOT NULL REFERENCES "user"(id),
    timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_time timestamp NOT NULL,
    end_time timestamp NOT NULL,
    equipment text NOT NULL REFERENCES equipment(id)
);

