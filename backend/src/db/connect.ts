import knex, { Knex } from 'knex'

export type Database = Knex<any, unknown[]>;

export function connect(): Database {
    const db = knex({
        client: "pg",
        connection: {
            host: "127.0.0.1",
            port: 59330,
            user: "test_user",
            password: "test",
            database: "test-db",
        },
    });
    return db;
}
