exports.up = function(knex) {
    return knex.schema.table('user', function(t) {
        t.integer('limit').notNull().defaultTo(5)
    })
}

exports.down = function(knex) {
    return knex.schema.table('user', function(t) {
        t.dropColumn('limit')
    })
}
