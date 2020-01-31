exports.up = function(knex) {
    return Promise.all([
        addTimeStamps('user', knex),
        addTimeStamps('user_event', knex),
        addTimeStamps('event', knex),
    ]);
}

exports.down = function(knex) {
    return Promise.all([
        dropTimeStamps('user', knex),
        dropTimeStamps('user_event', knex),
        dropTimeStamps('event', knex),
    ]);
}

const addTimeStamps = (table, knex) => (
    knex.schema.table(table, t => {
        t.dateTime('created_at', { useTz: false }).defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        t.dateTime('updated_at', { useTz: false }).defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    })
    .raw(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updated_at"=now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    `)
    .raw(`
        CREATE TRIGGER update_${table}_updated_at BEFORE UPDATE
        ON ?? FOR EACH ROW EXECUTE PROCEDURE
        update_updated_at_column();
    `, [table])
)

const dropTimeStamps = (table, knex) => (
    knex.schema.table(table, t => {
        t.dropColumn('created_at')
        t.dropColumn('updated_at')
    })
    .raw(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ??;`, [table])
    .raw('DROP FUNCTION IF EXISTS update_updated_at_column;')
)
