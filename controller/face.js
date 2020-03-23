const faceModel = require('../model/face.js');
const faceppModel = require('../model/facepp.js');
const faceUtil = require('../util/face')

const faceppObject = new faceppModel(
  process.env.FACEPP_KEY,
  process.env.FACEPP_SECRET,
  process.env.FACEPP_FACESET
)

const getFacesByID = async function (req, res, next) {
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

const searchFacesBySimilarName = async function (req, res, next) {
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

const createFacesByImage = async function (req, res, next) {
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

const searchFacesByImage = async function (req, res, next) {
  try {
    const [searchResult, searchError] = await faceppObject.search(`./${req.file.path}`)
    if (searchError) {
      console.error(searchError)
      res.status(500).json('Search face error')
      return
    }
    const searchResults = JSON.parse(searchResult.body).results
    const tokens = searchResults.map(token => token.face_token)
    const [tokenInfosResult, tokenInfosError] = await faceModel.selectByTokens(tokens)
    if (tokenInfosError) {
      console.error(searchError)
      res.status(500).json('Search face error')
      return
    }
    const tokenInfosHashMap = faceUtil.tokenInfosToHashMap(tokenInfosResult.rows)
    res.json(tokens
      .map(token => tokenInfosHashMap.get(token))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json('Search faces error')
  }
}

module.exports = {
  getFacesByID,
  searchFacesBySimilarName,
  createFacesByImage,
  searchFacesByImage
}