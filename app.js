const express = require('express')
const morgan = require('morgan')
const app = express()
const session = require('express-session')

// Add session middleware
app.use(
  session({
    secret: 'sandsgrowledcamelieknock',
    name: 'ai-chat-session',
    saveUninitialized: true,
    resave: false,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  }),
)

const port = process.env.PORT || 8051
const apiRoutes = require('./routes/api.js')

// Use morgan for logging incoming requests
app.use(morgan('dev'))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api', apiRoutes)

// Start the server
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`)
})
