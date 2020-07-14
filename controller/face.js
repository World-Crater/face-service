const faceModel = require('../model/face.js');
const faceppModel = require('../model/facepp.js');
const fileServiceModel = require('../model/file-service.js')
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

const getAllInfos = async function (req, res, next) {
  try {
    const limit = parseInt(req.query.limit)
    const offset = parseInt(req.query.offset)

    const [countAllInfosResult, countAllInfosError] = await faceModel.countAllInfos()
    if (countAllInfosError) throw countAllInfosError
    const [selectAllResult, selectAllError] = await faceModel.selectAllInfos(limit, offset)
    if (selectAllError) throw selectAllError
    res.json({
      limit: limit,
      offset: offset,
      count: countAllInfosResult,
      rows: selectAllResult.rows
    })
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

const createInfo = async function (req, res, next) {
  try {
    const previewURL = (await fileServiceModel.uploadImage(`./${req.file.path}`)).body.url
    const [insertFaceResult, insertFaceError] = await faceModel.insertInfo(req.body.name, req.body.romanization, req.body.detail, previewURL)
    if (insertFaceError) {
      console.error(insertFaceError)
      res.status(500).json('Insert database error')
      return
    }
    res.json({
      id: insertFaceResult.rows[0].id
    })
  } catch (err) {
    console.error(err)
    res.status(500).json('Get faces error')
  }
}

const updateInfo = async function (req, res, next) {
  try {
    const previewURL = (await fileServiceModel.uploadImage(`./${req.file.path}`)).body.url
    const [, insertFaceError] = await faceModel.updateInfo(req.body.name, req.body.romanization, req.body.detail, previewURL, req.params.id)
    if (insertFaceError) {
      console.error(insertFaceError)
      res.status(500).json('Insert database error')
      return
    }
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json('Get faces error')
  }
}

const createFacesByImage = async function (req, res, next) {
  try {
    const previewURL = (await fileServiceModel.uploadImage(`./${req.file.path}`)).body.url
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
    const [, insertFaceError] = await faceModel.insertFace(faceToken, previewURL, req.body.infoId)
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
    const [searchResult, searchError] = await faceppObject.search(`./${req.file.path}`, 3) // TODO: 3的這個參數需改成用req動態帶入
    if (searchError) {
      console.error(searchError)
      res.status(500).json('Search face error')
      return
    }
    const searchResults = JSON.parse(searchResult.body).results
    const tokens = searchResults.map(token => token.face_token)
    const [tokenInfosResult, tokenInfosError] = await faceModel.selectAllInfoAndTokenByTokens(tokens)
    if (tokenInfosError) {
      console.error(searchError)
      res.status(500).json('Search face error')
      return
    }
    const tokenInfosHashMap = faceUtil.tokenInfosToHashMap(tokenInfosResult.rows)
    res.json(searchResults
      .map(searchResult => ({
        ...tokenInfosHashMap.get(searchResult.face_token),
        recognitionPercentage: searchResult.confidence
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json('Search faces error')
  }
}

async function getRandomFaces (req, res, next) {
  const [randomSelectAllResult, randomSelectAllError] = await faceModel.randomSelectInfos(req.query.quantity)
  if (randomSelectAllError) {
    // todo: error handling
  }
  res.json(randomSelectAllResult.rows)
}

module.exports = {
  getFacesByID,
  searchFacesBySimilarName,
  createFacesByImage,
  searchFacesByImage,
  getRandomFaces,
  getAllInfos,
  createInfo,
  updateInfo
}