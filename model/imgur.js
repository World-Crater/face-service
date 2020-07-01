const request = require("request-promise")
const fs = require('fs')

function uploadImage (imagePath) {
  const image = fs.createReadStream(imagePath)
  return request({
    resolveWithFullResponse: true,
    method: "POST",
    url: "https://api.imgur.com/3/image",
    headers: {
      "Authorization": `Client-ID ${process.env.IMGUR_CLINET_ID}`,
      "Content-type": "multipart/form-data"
    },
    formData: {
      image
    }
  })
}

module.exports = {
  uploadImage
}