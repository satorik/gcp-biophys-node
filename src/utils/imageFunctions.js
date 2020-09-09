import path from 'path'
import { Storage } from '@google-cloud/storage'
import config from '../config/config'

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

export { clearImage as default, renameFile }
