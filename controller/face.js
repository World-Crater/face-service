const faceModel = require("../model/face.js");
const faceppModel = require("../model/facepp.js");
const faceppValidator = require("../model/facepp-validator.js");
const { promisify } = require("util");
const fs = require("fs");
const fileServiceModel = require("../model/file-service.js");
const faceUtil = require("../util/face");
const orm = require("../ormModel");
const Faceinfos = orm.faceinfos;
const Op = orm.Sequelize.Op;
const { Just, Nothing, None } = require("monet");

const faceppObject = new faceppModel(
  process.env.FACEPP_KEY,
  process.env.FACEPP_SECRET,
  process.env.FACEPP_FACESET
);
const faceppObject2 = new faceppModel(
  process.env.FACEPP_KEY,
  process.env.FACEPP_SECRET,
  process.env.FACEPP_FACESET2
);
const faceTokenMappingFaceppObject = [faceppObject, faceppObject2].reduce(
  (prev, curr) => prev.set(curr.faceppFaceset, curr),
  new Map()
);

const getFacesByID = async function (req, res, next) {
  try {
    const [selectByIDResult, selectByIDError] = await faceModel.selectByID(
      req.params.faceID
    );
    if (selectByIDError) {
      console.error(selectByIDError);
      res.status(500).json("Get faces error");
      return;
    }
    res.json(selectByIDResult.rows);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json("Get faces error");
    return;
  }
};

const getAllInfos = async function (req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const [
      countAllInfosResult,
      countAllInfosError,
    ] = await faceModel.countAllInfos();
    if (countAllInfosError) throw countAllInfosError;
    const [selectAllResult, selectAllError] = await faceModel.selectAllInfos(
      limit,
      offset,
      req.query.likeName
    );
    if (selectAllError) throw selectAllError;
    res.json({
      limit: limit,
      offset: offset,
      count: countAllInfosResult,
      rows: selectAllResult.rows,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json("Get faces error");
    return;
  }
};

const searchFacesBySimilarName = async function (req, res, next) {
  try {
    const [
      selectByIDResult,
      selectByIDError,
    ] = await faceModel.searchInfoIdBySimilarName(req.query.name);
    if (selectByIDError) {
      console.error(selectByIDError);
      res.status(500).json("Get faces error");
      return;
    }
    res.json(selectByIDResult.rows);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json("Get faces error");
    return;
  }
};

const createInfo = async function (req, res, next) {
  try {
    const previewURL = (
      await fileServiceModel.uploadImage(`./${req.file.path}`)
    ).body.url;
    const [insertFaceResult, insertFaceError] = await faceModel.insertInfo(
      req.body.name,
      req.body.romanization,
      req.body.detail,
      previewURL
    );
    if (insertFaceError) {
      console.error(insertFaceError);
      res.status(500).json("Insert database error");
      return;
    }
    res.json({
      id: insertFaceResult.rows[0].id,
    });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json("Get faces error");
  }
};

const updateInfo = async function (req, res) {
  let transaction = null;
  try {
    transaction = await orm.sequelize.transaction();

    if (req.file) {
      const previewURL = (
        await fileServiceModel.uploadImage(`./${req.file.path}`)
      ).body.url;
      await Faceinfos.update(
        { preview: previewURL },
        { where: { id: { [Op.eq]: req.params.id } } },
        { transaction }
      );
    }
    if (req.body.name) {
      await Faceinfos.update(
        { name: req.body.name },
        { where: { id: { [Op.eq]: req.params.id } } },
        { transaction }
      );
    }
    if (req.body.romanization) {
      await Faceinfos.update(
        { romanization: req.body.romanization },
        { where: { id: { [Op.eq]: req.params.id } } },
        { transaction }
      );
    }
    if (req.body.detail) {
      await Faceinfos.update(
        { detail: req.body.detail },
        { where: { id: { [Op.eq]: req.params.id } } },
        { transaction }
      );
    }

    await transaction.commit();
    res.sendStatus(204);
    next();
  } catch (err) {
    console.error(err);

    await transaction.rollback();
    res.status(500).json("Get faces error");
  }
};

const createFacesByImage = async function (req, res, next) {
  try {
    const previewURL = (
      await fileServiceModel.uploadImage(`./${req.file.path}`)
    ).body.url;
    const [detectResult, detectError] = await faceppObject.detect(
      `./${req.file.path}`
    );
    if (detectError) {
      console.error(
        `facepp object detect fail. ${detectError.statusCode}, ${detectError.response.body}`
      );
      res.status(500).json("Detect face error");
      return;
    }
    const faceToken = JSON.parse(detectResult.body).faces[0].face_token;
    const faceppHandlerMaybe = (
      await Promise.all([faceppObject.getDetail(), faceppObject2.getDetail()])
    )
      .map((results) =>
        results
          .map((result) => JSON.parse(result.body))
          .flatMap((result) =>
            faceppValidator.isFull(result) ? Nothing() : Just(result)
          )
      )
      .reduce(
        (_, curr) =>
          curr.isJust()
            ? curr.map((result) =>
                faceTokenMappingFaceppObject.get(result.faceset_token)
              )
            : Nothing(),
        Nothing()
      );
    if (faceppHandlerMaybe.isNothing()) {
      console.error("facesets all full. please create new faceset");
      res
        .status(500)
        .json({ error: "facesets all full. please create new faceset" });
      return;
    }
    const faceppHandler = faceppHandlerMaybe.getOrElse({});
    const [, addFaceError] = await faceppHandler.addFace([faceToken]);
    if (addFaceError) {
      console.error(addFaceError);
      res.status(500).json("Add face error");
      return;
    }
    const [, insertFaceError] = await faceModel.insertFace(
      faceToken,
      previewURL,
      req.body.infoId
    );
    if (insertFaceError) {
      console.error(detectError);
      res.status(500).json("Insert database error");
      return;
    }
    res.json({
      facesetToken: process.env.FACEPP_FACESET,
      faceToken: faceToken,
    });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json("Get faces error");
  }
};

const searchFacesByImage = async function (req, res, next) {
  try {
    const searchResult = await Promise.all([
      faceppObject.search(`./${req.file.path}`, 3), // TODO: 3的這個參數需改成用req動態帶入
      faceppObject2.search(`./${req.file.path}`, 3), // TODO: 3的這個參數需改成用req動態帶入
    ]);
    const searchResults = searchResult
      .reduce((prev, curr) => [...prev, ...JSON.parse(curr.body).results], [])
      .sort((a, b) => b.confidence - a.confidence)
      .map((item) => {
        console.log(item);
        return item;
      });
    const tokens = searchResults.map((token) => token.face_token);
    const [
      tokenInfosResult,
      tokenInfosError,
    ] = await faceModel.selectAllInfoAndTokenByTokens(tokens);
    if (tokenInfosError) {
      console.error(searchError);
      res.status(500).json({
        message: "Search face error",
      });
      return;
    }
    const tokenInfosHashMap = faceUtil.tokenInfosToHashMap(
      tokenInfosResult.rows
    );
    res.json(
      searchResults.slice(-3).map((searchResult) => ({
        ...tokenInfosHashMap.get(searchResult.face_token),
        recognitionPercentage: searchResult.confidence,
      }))
    );
    next();
  } catch (err) {
    console.error(err);
    await promisify(fs.unlink)(`./${req.file.path}`);
    res.status(500).json({
      message: "Search faces error",
    });
  }
};

async function getRandomFaces(req, res, next) {
  const [
    randomSelectAllResult,
    randomSelectAllError,
  ] = await faceModel.randomSelectInfos(req.query.quantity);
  if (randomSelectAllError) {
    // todo: error handling
  }
  res.json(randomSelectAllResult.rows);
}

module.exports = {
  getFacesByID,
  searchFacesBySimilarName,
  createFacesByImage,
  searchFacesByImage,
  getRandomFaces,
  getAllInfos,
  createInfo,
  updateInfo,
};
