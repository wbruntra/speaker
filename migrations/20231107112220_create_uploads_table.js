exports.up = function (knex) {
  return knex.schema.createTable('uploads', (table) => {
    table.increments('id').primary()
    // Replace text_hash and text_content with text_id foreign key reference
    table.integer('text_id').unsigned().references('id').inTable('texts').onDelete('CASCADE')
    table.string('file_url').notNullable()
    table.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('uploads')
}
