exports.up = function (knex) {
  return knex.schema.table('sessions', (table) => {
    table.string('description')
  })
}

exports.down = function (knex) {
  return knex.schema.table('sessions', (table) => {
    table.dropColumn('description')
  })
}
