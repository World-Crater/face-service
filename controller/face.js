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

exports.createFacesByImage = async function (req, res, next) {
  try {
    const [detectResult, detectError] = await faceppObject.detect(`./${req.file.path}`)
    if (detectError) {
      console.error(detectError)
      res.status(500).json('Get detect error')
      return
    }
    const [addFaceResult, addFaceError] = await faceppObject.addFace([JSON.parse(detectResult.body).faces[0].face_token])
    if (addFaceError) {
      console.error(addFaceError)
      res.status(500).json('Get add face error')
      return
    }
    res.json(JSON.parse(addFaceResult.body))
    return
  } catch (err) {
    console.error(err)
    res.status(500).json('Get faces error')
  }
}