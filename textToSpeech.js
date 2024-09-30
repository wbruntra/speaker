const { OpenAI } = require('openai')
const { uploadBuffer } = require('./uploadToLinode')
const crypto = require('crypto')
const knex = require('./db_connection')
const { File } = require('formdata-node')
const secrets = require('./secrets')

const openai = new OpenAI({
  apiKey: secrets.OPENAI_API_KEY,
})

const getTranscriptionCost = (text) => {
  const textLength = text.length
  const costPerCharacter = 0.015 / 1000
  return { characters: textLength, cost: textLength * costPerCharacter }
}

const getTextHash = (text) => {
  const textHash = crypto.createHash('md5').update(text).digest('hex').slice(0, 12)
  return textHash
}

const createTextEntry = async (text, description) => {
  if (!description) {
    description = text.slice(0, 63)
  }
  const textHash = getTextHash(text)
  const entry = {
    description,
    text_hash: textHash,
    content: text,
  }

  const existingText = await knex('texts').select('*').where('text_hash', textHash).first()

  if (existingText) return existingText

  await knex('texts').insert(entry)

  const result = await knex('texts').where({ text_hash: textHash }).first()
  return result
}

const createTTSJob = async (text, voice) => {
  const entry = {
    text_id: text.id,
    status: 'pending',
    voice,
  }
  // The insert method resolves to an array containing the inserted ids
  const [id] = await knex('jobs').insert(entry)
  // Append the id to the entry object
  return {
    ...entry,
    id, // This is the ID of the newly inserted row
  }
}

const createUploadsEntry = (job, file_url, description) => {
  const entry = {
    text_id: job.id,
    file_url,
  }
  return entry
}

/**
 * Perform text-to-speech on the given job.
 *
 * @param {Object} job - The job object containing details for text-to-speech.
 * @param {string} job.content - The text content to be converted to speech.
 * @param {string} [job.voice='echo'] - The voice model to be used for speech synthesis.
 * @param {string} job.text_hash - A unique hash for the text content, used for naming the output file.
 * @param {number} job.text_id - The ID of the text entry in the database.
 *
 * @returns {Promise<Object>} - The result object containing text_id, file_url, and content.
 */
async function performTextToSpeech(job) {
  try {
    console.log('Performing text-to-speech on job:', job)

    const textHash = job.text_hash

    // if there is an existing upload, return it
    const existingUpload = await knex('uploads').select('*').where('text_hash', textHash).first()

    if (existingUpload) {
      console.log('Existing upload found:', existingUpload)
      return { ...existingUpload, content: job.content }
    }

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: job.voice || 'nova',
      input: job.content,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    const result = await uploadBuffer(`tts/${textHash}.mp3`, buffer)
    const file_url = result.Location

    const uploadsEntry = {
      text_id: job.text_id,
      file_url,
      text_hash: textHash,
      full_text: job.content,
    }

    await knex('uploads').insert(uploadsEntry)

    return { ...uploadsEntry, content: job.content }
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

const transcribeAudioFile = async (fileBuffer, fileName) => {
  try {
    const file = new File([fileBuffer], fileName, { type: 'audio/wav' })

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    })

    console.log('Transcribed: ', transcription.text)

    return transcription.text
  } catch (error) {
    console.error('An error occurred during transcription:', error)
    throw error
  }
}

/**
 * Get the next response from ChatGPT based on the history of messages.
 * @param {Array} messageHistory - An array of message objects with 'role' and 'content'.
 * @returns {Promise<string>} - The response from ChatGPT.
 */
const getChatGPTResponse = async ({ messageHistory, model }) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: messageHistory,
      model: model || 'gpt-4o-mini',
    })

    const chatResponse = completion.choices[0].message.content
    console.log('ChatGPT response:', chatResponse)

    return chatResponse
  } catch (error) {
    console.error('An error occurred while getting the ChatGPT response:', error)
    throw error
  }
}

const getTextTranslation = async (text, targetLanguage = 'Spanish') => {
  try {
    const translation = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful translation assistant. You provide translations for the target text as requested, with no additional context.',
        },
        {
          role: 'user',
          content: `Translate the following text to ${targetLanguage}:\n ${text}`,
        },
      ],
    })

    const translatedText = translation.choices[0].message.content
    console.log('Translated text:', translatedText)
    return translatedText
  } catch (error) {
    console.error('An error occurred while translating the text:', error)
    throw error
  }
}

/**
 * Get the spoken response from ChatGPT based on the message history.
 *
 * @param {Array} messageHistory - An array of message objects with 'role' and 'content'.
 * @returns {Promise<Object>} - The response object containing:
 *   @property {number} text_id - The ID of the text entry in the database.
 *   @property {string} file_url - The URL of the generated audio file.
 *   @property {string} content - The text content that was converted to speech.
 */
const getSpokenResponse = async ({ messageHistory, model }) => {
  const textResponse = await getChatGPTResponse({ messageHistory, model })

  const audioResponse = await performTextToSpeech({
    content: textResponse,
    text_hash: getTextHash(textResponse),
  })

  return audioResponse
}

const run = async () => {
  const content = `¡Hola! Bienvenido a tu asistente de aprendizaje de idiomas. Estoy aquí para ayudarte a practicar español de una manera divertida y relajada. ¿Sobre qué tema te gustaría conversar hoy?`

  const speech = await performTextToSpeech({
    content,
    text_hash: getTextHash(content),
  })
  console.log('Speech:', speech)
}

if (require.main === module) {
  run().then(() => {
    console.log('Done.')
    process.exit(0)
  })
}

module.exports = {
  performTextToSpeech,
  createDatabaseEntry: createUploadsEntry,
  getTranscriptionCost,
  getTextHash,
  createTTSJob,
  createTextEntry,
  transcribeAudioFile,
  getChatGPTResponse,
  getSpokenResponse,
  getTextTranslation,
}
