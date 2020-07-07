const fs = require('fs')
const request = require('request')
const rp = require("request-promise")
const crypto = require('crypto')

// Please writing this arguments
const TOKEN = ''
const URL = 'https://api.worldcrater.com/face-service'
const BLACK_IMAGE_LIST = ['cf96b7b599fb5d5b69437571a1f57f9fa654c2d108435c3f7c1dbf2ece7fff4b', '0b52125a2c18ff21684bc8387c86aac06532d277a4610c182b94bc578f121041', 'c08250b7857193d909a9d20d65b41df2f1ded260871ec0c1253c8d90926cdf9f']
const MAX_COUNT = 500
const LIST = ''

const download = function(uri, filename, callback){
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {
        resolve()
      })
    })
  })
}

const uploadInfo = (name, imageName) => {
  const formData = {
    name,
    preview: fs.createReadStream(imageName),
  }
  return rp({
    method: 'POST',
    url: `${URL}/faces/info`,
    formData,
    headers: {
      authorization: TOKEN,
      'content-type': 'multipart/form-data; boundary=---011000010111000001101001'
    },
    json:true
  })
}

const uploadFace = async (infoId, imageName) => {
  try {
    const formData = {
      infoId,
      image: fs.createReadStream(imageName),
    }
    const result = await rp({
      method: 'POST',
      url: `${URL}/faces/face`,
      formData,
      headers: {
        authorization: TOKEN,
        'content-type': 'multipart/form-data; boundary=---011000010111000001101001'
      }
    })
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}

const getAllInfos = () => {
  return rp({
    method: 'GET',
    url: `${URL}/faces/info`,
    headers: {
      authorization: TOKEN,
      accept: 'application/json'
    },
    json:true
  })
}

const isFaceInfoExist = (infos, infoName) => (infos.filter(item => item.name === infoName).length > 0) ? true : false

const readList = list => list
  .split('\n')
  .map(item => item.split(','))
  .map(item => ({name: item[0], url: item[item.length - 1]}))
  .slice(0, -1)

const sleep = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, seconds)
  })
}

const isInBlackImageList = (imageName, blackList) => {
  return blackList.includes(crypto.createHash('sha256').update(fs.readFileSync(imageName)).digest('hex'))
}

const logFailUploadImage = imageName => {
  return new Promise((resolve, reject) => {
    fs.appendFile('failUploadImage.txt', `${imageName}\n`, err => (err) ? reject(err) : resolve())
  })
}

;(async () => {
  const list = readList(LIST)
  try {
    let count = 0
    let catchInfos = await getAllInfos()
    for (const info of list) {
      if (isFaceInfoExist(catchInfos, info.name)) {
        console.log(`Face ${info.name} is exist`)
        continue
      }
      catchInfos = await getAllInfos()
      const imageName = `${Date.now().toString()}.jpg`
      await download(info.url, imageName)
      if (isInBlackImageList(imageName, BLACK_IMAGE_LIST)) {
        console.log(`Face ${info.name} is in black list`)
        fs.unlinkSync(imageName)
        continue
      }
      const {
        id: infoId
      } = await uploadInfo(info.name, imageName)
      const [, uploadFaceError] = await uploadFace(infoId, imageName)
      if (uploadFaceError) {
        console.error(`Upload face ${info.name} fail`)
        logFailUploadImage(`${infoId}, ${info.name}, ${info.url}, ${imageName}`)
        continue
      }
      fs.unlinkSync(imageName)
      console.log(`Uploaded ${info.name}`)

      await sleep(3000)
      count++
      if (count >= MAX_COUNT) return console.log(`Done ${MAX_COUNT} faces`) 
    }
  } catch (err) {
    console.error(`Get error: ${err}`)
  }
})()

