const request = require("request-promise")
const fs = require('fs')

function uploadImage (imagePath) {
  const upload = fs.createReadStream(imagePath)
  return request({
    resolveWithFullResponse: true,
    method: "POST",
    url: `${process.env.FILE_SERVICE}/image/s3`,
    headers: {
      "Content-type": "multipart/form-data"
    },
    formData: {
      upload
    },
    json: true
  })
}

module.exports = {
  uploadImage
}