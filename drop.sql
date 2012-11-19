REVOKE ALL ON SCHEMA public FROM fightcode;
DROP DATABASE fightcode;
DROP ROLE fightcode;

CREATE ROLE fightcode LOGIN
  SUPERUSER INHERIT CREATEDB CREATEROLE;

CREATE DATABASE fightcode
  WITH OWNER = fightcode
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'en_US.UTF-8'
       LC_CTYPE = 'en_US.UTF-8'
       CONNECTION LIMIT = -1;

GRANT ALL ON SCHEMA public TO fightcode;
