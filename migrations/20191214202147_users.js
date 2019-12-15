exports.up = function(knex) {
    return Promise.all([
      knex.schema.createTable('user', function(table) {
        table.increments('id').primary();
        table.string('user_name').unique();
      }),
      knex.schema.createTable('user_event', function(table) {
        table.increments('id').primary();
        table.integer('from_id').references('users.id');
        table.integer('to_id').references('users.id');
        table.integer('event_id').references('event.id');
      }),
      knex.schema.createTable('event', function(table) {
        table.increments('id').primary();
        table.string('type');
      })
    ]);
  };

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('user'),
        knex.schema.dropTable('user_events'),
        knex.schema.dropTable('event')
    ]);
};
