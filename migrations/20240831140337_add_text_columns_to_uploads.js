exports.up = function (knex) {
  return knex.schema.table('uploads', (table) => {
    table.string('text_hash')
    table.text('full_text')
  })
}

exports.down = function (knex) {
  return knex.schema.table('uploads', (table) => {
    table.dropColumn('text_hash')
    table.dropColumn('full_text')
  })
}
