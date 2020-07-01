const fs = require('fs')
const request = require('request')
const rp = require("request-promise")

// Please writing this arguments
const TOKEN = ''
const URL = ''
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

const uploadFace = (infoId, imageName) => {
  const formData = {
    infoId,
    image: fs.createReadStream(imageName),
  }
  return rp({
    method: 'POST',
    url: `${URL}/faces/face`,
    formData,
    headers: {
      authorization: TOKEN,
      'content-type': 'multipart/form-data; boundary=---011000010111000001101001'
    }
  })
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
  .map(item => item.split(', '))
  .map(item => ({name: item[0], url: item[1]}))

const sleep = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, seconds)
  })
}

;(async () => {
  const list = readList(LIST)
  try {
    let count = 0
    const maxCount = 50
    for (const info of list) {
      if (isFaceInfoExist(await getAllInfos(), info.name)) {
        console.log('Face is exist')
        continue
      }
      const imageName = `${Date.now().toString()}.jpg`
      await download(info.url, imageName)
      const {
        id: infoId
      } = await uploadInfo(info.name, imageName)
      await uploadFace(infoId, imageName)
      fs.unlinkSync(imageName)
      console.log(`Uploaded ${info.name}`)

      await sleep(3000)
      count++
      if (count >= maxCount) return console.log(`Done ${maxCount} faces`) 
    }
  } catch (err) {
    console.error(`Get error: ${err}`)
  }
})()

