const ow = require('ow')
const Result = require('folktale/result')

function checkArguments(schema) {
  return (req, res, next) => {
    const result = Result.try((_) => ow({ query: req.query }, ow.object.exactShape(schema)))
    if (Result.Error.hasInstance(result)) {
      console.error(result)
      return res.status(422).json({
        error: 'Error arguments',
      })
    }
    next()
  }
}

module.exports = {
  checkArguments,
}
