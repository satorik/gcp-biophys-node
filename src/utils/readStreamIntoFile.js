import path from 'path'
import uuidv4 from 'uuidv4'
import fs from 'fs'
import { Storage } from '@google-cloud/storage'
import config from '../config/config'

export default (
  file,
  subDir,
  uploadName = '',
  type = 'image',
  withImage = false
) => {
  return new Promise((resolve, reject) => {
    const { createReadStream: apolloStream, filename, mimetype } = file
    let rootDir = 'images'
    let savedFileName = ''

    if (type === 'image') {
      if (
        !(
          mimetype === 'image/png' ||
          mimetype === 'image/jpeg' ||
          mimetype === 'image/jpg'
        )
      ) {
        const error = new Error('Forbidden file type ', mimetype)
        error.code = 415
        return reject(error)
      }
      savedFileName = uuidv4() + path.extname(filename)
    }
    if (type === 'pdf') {
      if (!(mimetype === 'application/pdf')) {
        const error = new Error('Forbidden file type ', mimetype)
        error.code = 415
        return reject(error)
      }
      rootDir = 'files'
      savedFileName = uploadName + path.extname(filename)
    }

    const storage = new Storage()
    const bucket = storage.bucket(config.GCLOUD_STORAGE_BUCKET)

    const filePath = path
      .join(rootDir, subDir, savedFileName)
      .replace(/\\/g, '/')
    const blob = bucket.file(filePath)
    const savedTmpFile = path.join(__dirname, '..', 'tmp', savedFileName)
    const readStream = apolloStream()

    if (type === 'image') {
      readStream
        .on('error', error => {
          return reject(error)
        })
        .pipe(blob.createWriteStream({ resumable: false }))
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          resolve({
            file: savedTmpFile,
            imageUrl: publicUrl,
            fileLink: publicUrl,
          })
        })
    }
    if (type === 'pdf') {
      if (withImage) {
        if (!fs.existsSync(path.join(__dirname, '..', 'tmp'))) {
          fs.mkdirSync(path.join(__dirname, '..', 'tmp'))
        }
        readStream.pipe(fs.createWriteStream(savedTmpFile))
      }

      readStream
        .on('error', error => {
          return reject(error)
        })
        .pipe(blob.createWriteStream({ resumable: false }))
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          resolve({
            file: savedTmpFile,
            imageUrl: publicUrl,
            fileLink: publicUrl,
          })
        })
    }
  })
}
