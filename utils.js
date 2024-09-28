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

module.exports = {
  verifyPassword,
}