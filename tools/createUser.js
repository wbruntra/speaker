const db = require('../db_connection')
const bcrypt = require('bcrypt')

/**
 * Verifies if the given password matches the hashed password.
 * @param {string} password - The plain text password to verify.
 * @param {string} hash - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the password matches the hash, otherwise false.
 */
const verifyPassword = async (password, hash) => {
  try {
    const match = await bcrypt.compare(password, hash)
    return match
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

const run = async () => {
  const entry = {
    username: 'bill',
    password: 'test123',
  }

  // Hash the password before saving it to the database
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(entry.password, saltRounds)

  // Update the entry with the hashed password
  entry.password = hashedPassword

  await db('users').insert(entry)
}

// Example usage
// const runVerification = async () => {
//   const password = 'test123'
//   const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z2s7Z6lqgP1J1J1J1J1J1' // Example hash

//   const isMatch = await verifyPassword(password, hash)
//   console.log('Password match:', isMatch)
// }

// runVerification()

run().then(() => {
  console.log('User created successfully')
  process.exit(0)
})