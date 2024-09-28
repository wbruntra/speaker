exports.up = function (knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.string('id').primary().unique()
    table.json('message_history')
    table.json('data')
    table.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('sessions')
}
