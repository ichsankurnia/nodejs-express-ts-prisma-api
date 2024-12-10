Next steps:

1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run `prisma db pull` to turn your database schema into a Prisma schema.
4. Run `prisma generate` to generate the Prisma Client. You can then start querying your database.
5. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and real-time database events. Read: https://pris.ly/cli/beyond-orm

### Migrate

To map your data model to the database schema, you need to use the prisma migrate CLI commands:

`npx prisma migrate dev --name init`

This command does two things:

It creates a new SQL migration file for this migration
It runs the SQL migration file against the database

run `prisma migrate dev --name [migration_name]` to update schema/table in database
run `prisma generate` to update schema in prisma client
