const faceModel = require('../model/face.js');
const faceppModel = require('../model/facepp.js');

const faceppObject = new faceppModel(
  process.env.FACEPP_KEY,
  process.env.FACEPP_SECRET,
  process.env.FACEPP_FACESET
)

exports.getFacesByID = async function (req, res, next) {
  try {
    const [selectByIDResult, selectByIDError] = await faceModel.selectByID(req.params.faceID)
    if (selectByIDError) {
      console.error(selectByIDError)
      res.status(500).json('Get faces error')
      return
    }
    res.json(selectByIDResult.rows)
    return
  } catch (err) {
    console.error(err)
    res.status(500).json('Get faces error')
    return
  }
}

exports.searchFacesBySimilarName = async function (req, res, next) {
  try {
    const [selectByIDResult, selectByIDError] = await faceModel.searchInfoIdBySimilarName(req.query.name)
    if (selectByIDError) {
      console.error(selectByIDError)
      res.status(500).json('Get faces error')
      return
    }
    res.json(selectByIDResult.rows)
    return
  } catch (err) {
    console.error(err)
    res.status(500).json('Get faces error')
    return
  }
}

exports.createFacesByImage = async function (req, res, next) {
  try {
    const [detectResult, detectError] = await faceppObject.detect(`./${req.file.path}`)
    if (detectError) {
      console.error(detectError)
      res.status(500).json('Detect face error')
      return
    }
    const faceToken = JSON.parse(detectResult.body).faces[0].face_token
    const [, addFaceError] = await faceppObject.addFace([faceToken])
    if (addFaceError) {
      console.error(addFaceError)
      res.status(500).json('Add face error')
      return
    }
    const [, insertFaceError] = await faceModel.insertFace(faceToken, req.body.previewURL, req.body.infoId)
    if (insertFaceError) {
      console.error(detectError)
      res.status(500).json('Insert database error')
      return
    }
    res.json({
      facesetToken: process.env.FACEPP_FACESET,
      faceToken: faceToken
    })
  } catch (err) {
    console.error(err)
    res.status(500).json('Get faces error')
  }
}