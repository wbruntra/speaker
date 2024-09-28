exports.up = function (knex) {
  return knex.schema.createTable('jobs', function (table) {
    table.increments('id').primary()
    table.integer('text_id').unsigned().references('id').inTable('texts').onDelete('CASCADE')
    table.string('status').defaultTo('pending') // Status of the job (e.g., pending, processing, completed, failed)
    table.string('file_url').nullable() // URL to the audio file once it is ready
    table.timestamps(true, true) // Adds created_at and updated_at columns with the current timestamp
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('jobs')
}
