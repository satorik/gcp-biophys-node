import path from 'path'
import fs, { truncateSync } from 'fs'
import { Storage } from '@google-cloud/storage'
import config from '../config/config'

const gmToBuffer = data => {
  return new Promise((resolve, reject) => {
    data.stream((err, stdout, stderr) => {
      if (err) {
        return reject(err)
      }
      const chunks = []
      stdout.on('data', chunk => {
        chunks.push(chunk)
      })
      stdout.once('end', () => {
        resolve(Buffer.concat(chunks))
      })
      stderr.once('data', data => {
        reject(String(data))
      })
    })
  })
}

const clearImage = async (imagePath, subDir, type = 'image') => {
  const storage = new Storage()
  const bucket = storage.bucket(config.GCLOUD_STORAGE_BUCKET)
  const rootDir = type === 'image' ? 'images' : 'files'
  const file = bucket.file(
    path
      .join(rootDir, subDir, imagePath.substr(imagePath.lastIndexOf('/') + 1))
      .replace(/\\/g, '/')
  )
  try {
    await file.delete()
  } catch (err) {
    console.log(err)
  }
}

const renameFile = async (fileLink, subDir, newName) => {
  const storage = new Storage()
  const bucket = storage.bucket(config.GCLOUD_STORAGE_BUCKET)
  const rootDir = 'files'
  const file = bucket.file(
    path
      .join(rootDir, subDir, fileLink.substr(fileLink.lastIndexOf('/') + 1))
      .replace(/\\/g, '/')
  )
  const newFile = path.join(rootDir, subDir, newName).replace(/\\/g, '/')
  try {
    await file.move(newFile)
    return `https://storage.googleapis.com/${bucket.name}/${newFile}`
  } catch (err) {
    console.log(err)
  }
}

const convertPdfToBase64 = file => {
  const PDF2Pic = require('pdf2pic')
  const pdf2pic = new PDF2Pic({
    density: 100, // output pixels per inch
    format: 'png', // output file format
    size: '400x600', // output size in pixels
  })

  return pdf2pic.convertToBase64(file, [1])
}

export { clearImage as default, convertPdfToBase64, renameFile }
