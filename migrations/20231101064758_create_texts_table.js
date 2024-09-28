exports.up = function (knex) {
  return knex.schema.createTable('texts', (table) => {
    table.increments('id').primary()
    table.string('description')
    table.string('text_hash', 32).unique().notNullable()
    table.text('content').notNullable()
    table.timestamps(true, true)

    table.index('text_hash')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('texts')
}
