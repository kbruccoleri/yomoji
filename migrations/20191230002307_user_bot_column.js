
exports.up = function(knex) {
    return knex.schema.table('user', function(t) {
        t.bool('is_bot').defaultTo(false)
    })
}

exports.down = function(knex) {
    return knex.schema.table('user', function(t) {
        t.dropColumn('is_bot')
    })
}
