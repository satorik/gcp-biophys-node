import path from 'path'
import uuidv4 from 'uuidv4'
import fs from 'fs'

export default (file, subDir, type = 'image') => {
  return new Promise((resolve, reject) => {
    const { createReadStream : apolloStream, filename, mimetype } = file
    let rootDir = 'images'
  
    if (type === 'image') {
      if (!(mimetype === 'image/png' || mimetype === 'image/jpeg' || mimetype === 'image/jpg')){
        const error = new Error('Forbidden file type ', mimetype)
        error.code = 415
        return reject(error)
      }
    }
    if (type === 'pdf') {
      console.log('readStreamIntoFile', mimetype)
      if (!(mimetype === 'application/pdf')){
        const error = new Error('Forbidden file type ', mimetype)
        error.code = 415
        return reject(error)
      }
      rootDir = 'files'
    }
    console.log('readStreamIntoFile', rootDir)
    
    try {
      fs.mkdirSync(path.join(__dirname, '..', rootDir, subDir), {recursive: true})
    }
    catch (error) {
      return reject(error)
    }

    const savedFileName = uuidv4()+path.extname(filename)
    const savedFile = path.join(__dirname, '..', rootDir, subDir, savedFileName)
    const filePath = path.join('/', rootDir, subDir, savedFileName).replace(/\\/g, "/")
    
    const readStream  = apolloStream()
    readStream.on('error', error => {
      if (readStream.truncated) fs.unlinkSync(savedFile)
      return reject(error)
    })
    // .on('readable', () => {
    //   let chunk;
    //   while (null !== (chunk = readStream.read())) {
    //     console.log(`Received ${chunk.length} bytes of data.`);
    //   }
    // })
    .pipe(fs.createWriteStream(savedFile))
    .on('finish', () => resolve({file: savedFile, imageUrl: filePath, fileLink: filePath}))
    })
}