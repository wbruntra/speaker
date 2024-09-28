var express = require('express')
var router = express.Router()
const db = require('../db_connection')
const {
  performTextToSpeech,
  createTTSJob,
  createTextEntry,
  transcribeAudioFile,
  getChatGPTResponse,
  getSpokenResponse,
  getTextTranslation,
} = require('../textToSpeech')
const multer = require('multer')
const path = require('path')
const utils = require('../utils')

// Configure multer to preserve the original file extension
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/')
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname)
//     cb(null, `${file.fieldname}-${Date.now()}${ext}`)
//   },
// })

// const upload = multer({ storage: storage })

// Configure multer to store file buffer in memory
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

class TextInfo {
  static async getById(id) {
    const text = await db({ t: 'texts' })
      .join({ u: 'uploads' }, 't.id', 'u.text_id')
      .select('t.*', 'u.file_url')
      .where('t.id', id)
      .first()
    return text
  }
}

router.get('/', async (req, res, next) => {
  return res.json({ message: 'Welcome to the API' })
})

router.get('/logout', async (req, res, next) => {
  req.session.destroy()
  return res.send({ message: 'Logout successful' })
})

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body

  const user = await db({ u: 'users' }).select('*').where('u.username', username).first()

  if (!user) {
    return res.status(401).send({ message: 'Invalid username or password' })
  }

  const passwordMatch = await utils.verifyPassword(password, user.password)

  if (!passwordMatch) {
    return res.status(401).send({ message: 'Invalid username or password' })
  }

  // req.session.user = user
  req.session.username = user.username
  req.session.authed = true
  req.session.user_id = user.id

  return res.send({ message: 'Login successful' })
})

router.get('/status', async (req, res, next) => {
  return res.send({
    id: req.session.user_id,
    username: req.session.username,
    authed: req.session.authed,
  })
})

const requireSignIn = (req, res, next) => {
  if (!req.session.authed) {
    return res.status(401).send({ message: 'Unauthorized' })
  }
  next()
}

router.get('/uploads', async (req, res, next) => {
  const uploads = await db({ ul: 'uploads' })
    .join({ tx: 'texts' }, 'ul.text_id', 'tx.id')
    .select('*')
    .whereNotNull('ul.file_url')
  return res.send(uploads)
})

router.get('/uploads/:id', async (req, res, next) => {
  const { id } = req.params
  const upload = await TextInfo.getById(id)

  return res.send(upload)
})

router.post('/text-to-speech', async (req, res, next) => {
  const { text, voice } = req.body

  const dbText = await createTextEntry(text)

  const job = await createTTSJob(dbText, voice)

  return res.send(job)
})

router.use(requireSignIn)

router.post('/upload-audio', upload.single('file'), async (req, res, next) => {
  try {
    const fileBuffer = req.file.buffer
    const fileName = req.file.originalname
    const action = req.body.action

    // Check if the buffer is not empty
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).send({ message: 'Empty file buffer' })
    }

    // Log file details for debugging
    console.log('File details:', {
      originalname: fileName,
      mimetype: req.file.mimetype,
      size: req.file.size,
    })

    // Transcribe the audio file
    let transcription = await transcribeAudioFile(fileBuffer, fileName)

    if (action === 'translate') {
      transcription = await getTextTranslation(transcription)
    }

    return res.status(200).send({ message: 'File uploaded successfully', transcription })
  } catch (error) {
    console.error('Upload error:', error)
    next(error)
  }
})

router.post('/chat', async (req, res) => {
  const { messageHistory, session_id, no_spoken_response } = req.body

  const user_id = req.session.user_id

  const chatGPTMessages = messageHistory.map((message) => ({
    role: message.role,
    content: message.content,
  }))

  let response
  let newMessageHistory

  if (!no_spoken_response) {
    response = await getSpokenResponse(chatGPTMessages)
    newMessageHistory = [
      ...messageHistory,
      { role: 'assistant', content: response.content, audio_url: response.file_url },
    ]
  } else {
    response = await getChatGPTResponse(chatGPTMessages)
    newMessageHistory = [
      ...messageHistory,
      { role: 'assistant', content: response },
    ]
  }

  // find the session if it exists, otherwise create a new one
  if (session_id) {
    const session = await db({ s: 'sessions' }).select('*').where('s.id', session_id).first()

    if (!session) {
      await db('sessions').insert({
        id: session_id,
        message_history: JSON.stringify(newMessageHistory),
        user_id,
      })
    } else {
      await db('sessions')
        .where('id', session_id)
        .update({ message_history: JSON.stringify(newMessageHistory) })
    }
  }

  return res.send({
    messageHistory: newMessageHistory,
  })
})

router.get('/session/:session_id', async (req, res) => {
  const { session_id } = req.params

  const session = await db({ s: 'sessions' }).select('*').where('s.id', session_id).first()

  if (!session) {
    return res.status(200).send({ newSession: true })
  }

  return res.send({
    session,
    messageHistory: session?.message_history ? JSON.parse(session.message_history) : null,
  })
})

router.get('/sessions', async (req, res) => {
  const user_id = req.session.user_id

  const sessions = await db({ s: 'sessions' }).select('*').where('s.user_id', user_id)

  return res.send(sessions)
})

router.post('/session/update-description', async (req, res) => {
  const { session_id, description } = req.body

  await db('sessions').where('id', session_id).update({ description })

  return res.send({ message: 'Session description updated' })
})

module.exports = router
