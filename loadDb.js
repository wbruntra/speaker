const knex = require('./db_connection')
const fs = require('fs')
const data = require('./uploads.json')
const { getTextHash } = require('./textToSpeech')

const getOrInsertText = async (text) => {
  const textEntry = {
    description: text.description,
    text_hash: text.text_hash,
    content: text.text_content,
    created_at: text.created_at,
    updated_at: text.updated_at,
  }

  const existingText = await knex('texts').select('*').where('text_hash', item.text_hash).first()

  if (existingText) return existingText

  const [id] = await knex('texts').insert(textEntry)
  return {
    ...textEntry,
    id,
  }
}

const getOrInsertUpload = async (item, textRow) => {
  const uploadEntry = {
    text_id: textRow.id,
    file_url: item.file_url,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }

  const existingUpload = await knex('uploads').select('*').where('text_id', textRow.id).first()

  if (existingUpload) return existingUpload

  const [id] = await knex('uploads').insert(uploadEntry)
  return {
    ...uploadEntry,
    id,
  }
}

const run = async () => {
  for (item of data) {
    // console.log(item)
    const textRow = await getOrInsertText(item)
    console.log(textRow)

    const upload = await getOrInsertUpload(item, textRow)
    console.log(upload)
  }
  return
  // const uploads = await knex('uploads').select('*')

  // const uploads = await knex('uploads').select('*')

  // fs.writeFileSync('./uploads.json', JSON.stringify(uploads, null, 2))

  // console.log('uploads:', uploads)
}

run().then(() => {
  process.exit(0)
})
