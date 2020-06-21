const token = require('../helper/token')

async function verifyToken (req, res, next) {
  try {
    const decode = await token.verify(req.headers.authentication)
    res.locals = {
      ...req.local,
      decode
    }
    next()
  } catch (err) {
    res.status(403).json({
      error: 'Invalid token'
    })
  }
}

module.exports = {
  verifyToken
}