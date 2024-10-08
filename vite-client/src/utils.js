function getRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

export const generateRandomSessionKey = () => {
  return `${getRandomString(5)}-${getRandomString(5)}-${getRandomString(5)}`
}
