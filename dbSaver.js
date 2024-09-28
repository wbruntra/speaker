const knex = require('./db_connection')
const fs = require('fs')

const run = async () => {
  // const uploads = await knex('uploads').select('*')

  const uploads = await knex('uploads').select('*')

  fs.writeFileSync('./uploads.json', JSON.stringify(uploads, null, 2))

  console.log('uploads:', uploads)
}

run().then(() => {
  process.exit(0)
})
