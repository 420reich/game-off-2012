REVOKE ALL ON SCHEMA public FROM fightcode;
DROP DATABASE IF EXISTS fightcode;
DROP ROLE fightcode;

CREATE ROLE fightcode LOGIN
  SUPERUSER INHERIT CREATEDB CREATEROLE;

CREATE DATABASE fightcode
  WITH OWNER = fightcode
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       TEMPLATE = template0;

GRANT ALL ON SCHEMA public TO fightcode;
