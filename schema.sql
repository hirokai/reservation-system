DROP TABLE gcalendar_event_for_reservation;

DROP TABLE reservation;

DROP TABLE gcalendar_for_equipment;

DROP TABLE equipment_in_gcalendar_for_user;

DROP TABLE gcalendar_for_user;

DROP TABLE equipment;

DROP TABLE place;

DROP TABLE user_permission;

DROP TABLE "user_session";

DROP TABLE "user";

DROP EXTENSION pgcrypto;

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
    id text PRIMARY KEY DEFAULT (concat('U', nanoid(12))),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    "role" text
);

CREATE TABLE "user_session"(
    session_id text PRIMARY KEY DEFAULT (concat('S', nanoid())),
    "user" text NOT NULL REFERENCES "user"(id),
    timestamp timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "user_permission"(
    "user" text NOT NULL REFERENCES "user"(id),
    permission text NOT NULL,
    PRIMARY KEY ("user", permission)
);

CREATE TABLE place(
    id text PRIMARY KEY DEFAULT (concat('P', nanoid(8))),
    name text NOT NULL,
    description text
);

CREATE TABLE equipment(
    id text PRIMARY KEY DEFAULT (concat('E', nanoid(8))),
    name text NOT NULL UNIQUE,
    description text,
    place text REFERENCES place(id),
    model text,
    metadata jsonb,
    prop1_key text,
    prop1_type text,
    prop2_key text,
    prop2_type text,
    prop3_key text,
    prop3_type text,
    prop4_key text,
    prop4_type text,
    prop5_key text,
    prop5_type text
);

CREATE TABLE gcalendar_for_user(
    gcalendar_id text PRIMARY KEY,
    "user" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE equipment_in_gcalendar_for_user(
    gcalendar_id text NOT NULL REFERENCES "gcalendar_for_user"(gcalendar_id) ON DELETE CASCADE,
    equipment text NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (gcalendar_id, equipment)
);

CREATE TABLE gcalendar_for_equipment(
    gcalendar_id text PRIMARY KEY,
    equipment text UNIQUE NOT NULL REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE gcalendar_for_equipment_subscription(
    gcalendar_id text NOT NULL REFERENCES "gcalendar_for_user"(gcalendar_id) ON DELETE CASCADE,
    "user" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    PRIMARY KEY (gcalendar_id, "user")
);

CREATE TABLE reservation(
    id text PRIMARY KEY DEFAULT (concat('R', nanoid())),
    "user" text NOT NULL REFERENCES "user"(id),
    timestamp timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    equipment text NOT NULL REFERENCES equipment(id),
    "comment" text,
    prop1_key text,
    prop1_value text,
    prop2_key text,
    prop2_value text,
    prop3_key text,
    prop3_value text,
    prop4_key text,
    prop4_value text,
    prop5_key text,
    prop5_value text
);

CREATE TABLE gcalendar_event_for_reservation(
    gcalendar_event_id text PRIMARY KEY,
    gcalendar_id text NOT NULL,
    reservation text NOT NULL REFERENCES reservation(id)
);

