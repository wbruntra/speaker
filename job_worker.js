const knex = require('./db_connection')
const { performTextToSpeech } = require('./textToSpeech')

async function runJob(job) {
  // Run text-to-speech function on job text
  console.log(
    `Running job ${job.job_id} with text: ${job.content.slice(0, 40)}..., text_id: ${job.text_id}`,
  )
  const result = await performTextToSpeech(job)

  return result
}

async function runWorker() {
  while (true) {
    // Get next job from jobs table
    const job = await knex({ j: 'jobs' })
      .join({ t: 'texts' }, 't.id', 'j.text_id')
      .select('t.*', 'j.status', 'j.text_id', 'j.id as job_id', 'j.voice')
      .where('j.status', 'pending')
      .orderBy('created_at')
      .first()
    // console.log('job:', job)
    // return

    if (!job) {
      console.log('No pending jobs found, waiting for new jobs...')
      await new Promise((resolve) => setTimeout(resolve, 8000)) // Wait 8 seconds before checking for new jobs
      continue
    }

    // Update job status to running
    await knex('jobs').where('id', job.job_id).update('status', 'running')
    // Run job
    try {
      await runJob(job)

      // ensure upload was successful
      const upload = await knex({ u: 'uploads' })
        .select('*')
        .where('u.text_id', job.text_id)
        .first()

      console.log('upload:', upload)

      if (upload && upload.file_url) {
        await knex('jobs').where('id', job.job_id).update('status', 'completed')
      } else {
        await knex('jobs').where('id', job.job_id).update('status', 'failed')
      }
    } catch (error) {
      console.error(`Error running job ${job.job_id}: ${error}`)
      // Update job status to failed
      await knex('jobs').where('id', job.job_id).update('status', 'failed')
    }
  }
}

if (require.main === module) {
  runWorker()
}
