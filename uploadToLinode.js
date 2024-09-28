const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { createReadStream } = require('fs')
const { basename } = require('path')
const secrets = require('./secrets.js')

const REGION = secrets.REGION
const BUCKET_NAME = secrets.BUCKET_NAME
const ACCESS_KEY = secrets.ACCESS_KEY
const SECRET_KEY = secrets.SECRET_KEY
const ENDPOINT = secrets.ENDPOINT

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  endpoint: ENDPOINT,
  forcePathStyle: true, // needed for Linode Object Storage
})

const uploadFile = async (filePath) => {
  console.log(`Uploading file: ${filePath}`)
  const fileStream = createReadStream(filePath)
  const fileKey = basename(filePath)

  try {
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileStream,
      }),
    )
    console.log(`File uploaded successfully: ${fileKey}`)
    return data // Contains details of the operation
  } catch (err) {
    console.error('Error', err)
    throw err
  }
}

const uploadBuffer = async (fileKey, fileBuffer) => {
  try {
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ACL: 'public-read',
      }),
    )
    const fileUrl = `${ENDPOINT}/${BUCKET_NAME}/${fileKey}`

    console.log(`File uploaded successfully: ${fileKey}`)
    return { ...data, Location: fileUrl }
  } catch (err) {
    console.error('Error during file upload:', err)
    throw err
  }
}

// Main function to call when this file is run
const main = async () => {
  const filePath = process.argv[2]
  if (!filePath) {
    throw new Error('Please provide the file path as an argument.')
  }

  return uploadFile(filePath)
}

module.exports = { uploadFile, uploadBuffer, main }
