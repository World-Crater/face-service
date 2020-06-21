const jwt = require('jsonwebtoken')
const fs = require('fs')

const publicKey = fs.readFileSync('./public.pem')

function verify (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, function(err, decoded) {
      if (err) return reject(err)
      resolve(decoded)
    })
  })
}

module.exports = {
  verify
}