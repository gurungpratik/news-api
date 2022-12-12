# Northcoders News API

## Background

We will be building an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

Your database will be PSQL, and you will interact with it using [node-postgres](https://node-postgres.com/).


## Creating the .env files

1. Create an .env.test and .env.development file within the root project directory.

2. Insert `PGDATABASE=<insert_database_name>` into each of the .env files with the corresponding database name for the environment.

3. Database names are stored in the setup.sql file within the db directory.