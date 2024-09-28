const knex = require('./db_connection')

const run = async () => {
  // const uploads = await knex('uploads').select('*')

  const jobs = await knex({ j: 'jobs' })
    .join({ t: 'texts' }, 't.id', 'j.text_id')
    // .where('j.status', 'pending')
    .select('j.*', 't.description', 't.text_hash')

  await knex('jobs').update('status', 'pending').where({
    id: 3,
  })

  // console.log('uploads:', uploads)

  console.log('jobs:', jobs)
}

run().then(() => {
  process.exit(0)
})
