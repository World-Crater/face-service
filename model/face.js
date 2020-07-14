const { Pool } = require('pg')
const R = require('ramda')
const _ = require('lodash')

const pgOptions = {
  host: process.env.PG_ENDPOINT,
  port: process.env.PG_PORT,
  database: process.env.PG_SQL_DATABASE,
  user: process.env.PG_SQL_USER,
  password: process.env.PG_SQL_PASSWORD,
  max: 5,
  idleTimeoutMillis: 5000,
  ssl: false,
  connectionTimeoutMillis: 10000
}

const pgPool = new Pool(pgOptions)
pgPool.on('error', function (err) {
  console.error(`postgresSQL error: ${err}`)
})

exports.selectAll = async function () {
  try {
    const sql = `
    SELECT
    *
    FROM
    facefaces
    `
    const sqlParams = []
    return [await pgPool.query(sql, sqlParams), null]
  } catch (err) {
    return [null, err]
  }
}

exports.countAllInfos = async function () {
  try {
    const sql = `
    SELECT COUNT (id)
    FROM faceinfos
    `
    const sqlParams = []
    const result = await pgPool.query(sql, sqlParams)
    const count = R.pipe(
      R.path(['rows', [0], 'count']),
      value => value === null ? new Error('Count Infos error') : value,
      parseInt
    )(result)
    if (_.isError(count)) throw count
    return [count, null]
  } catch (err) {
    return [null, err]
  }
}

exports.selectAllInfos = async function (limit, offset) {
  try {
    const sql = `
    SELECT
    *
    FROM
    faceinfos
    LIMIT $1 OFFSET $2
    `
    const sqlParams = [limit, offset]
    return [await pgPool.query(sql, sqlParams), null]
  } catch (err) {
    return [null, err]
  }
}

exports.randomSelectInfos = async function (quantity) {
  try {
    const sql = `
    SELECT
    *
    FROM faceinfos
    ORDER BY RANDOM()
    LIMIT $1
    `
    const sqlParams = [quantity]
    return [await pgPool.query(sql, sqlParams), null]
  } catch (err) {
    return [null, err]
  }
}

exports.selectByID = async function (faceID) {
  try {
    const sql = `
    SELECT
    *
    FROM
    facefaces
    INNER JOIN faceinfos
    ON faceinfos.id = facefaces.infoid
    WHERE faceinfos.id = $1
    `
    const sqlParams = [faceID]
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}

exports.selectByToken = async function (token) {
  try {
    const sql = `
    SELECT
    *
    FROM
    faceinfos
    INNER JOIN facefaces
    ON faceinfos.id = facefaces.infoid
    WHERE facefaces.token = $1
    `
    const sqlParams = [token]
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}

exports.selectAllInfoAndTokenByTokens = async function (tokens) {
  try {
    const sqlCondition = tokens
      .map((_, index) => `facefaces.token = $${index + 1}`)
      .join(' OR ')
    const sql = `
    SELECT
    faceinfos.*, facefaces.token
    FROM
    faceinfos
    INNER JOIN facefaces
    ON faceinfos.id = facefaces.infoid
    WHERE ${sqlCondition}
    `
    const sqlParams = tokens
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    console.log(err)
    return [null, err]
  }
}

exports.insertFace = async function (token, preview, infoId) {
  try {
    const sql = `
    INSERT INTO
    facefaces (token, preview, infoid)
    VALUES ($1, $2, $3);
    `
    const sqlParams = [token, preview, infoId]
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}

exports.insertInfo = async function (name, romanization, detail, preview) {
  try {
    const sql = `
    INSERT INTO
    faceinfos (name, romanization, detail, preview)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `
    const sqlParams = [name, romanization, detail, preview]
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}

exports.updateInfo = async function (name, romanization, detail, preview, id) {
  try {
    const sql = `
    UPDATE faceinfos
    SET name=$1, romanization=$2, detail=$3, preview=$4
    WHERE id=$5
    `
    const sqlParams = [name, romanization, detail, preview, id]
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}

exports.searchInfoIdBySimilarName = async function (similarName) {
  try {
    const sql = `
    SELECT
    *
    FROM faceinfos
    WHERE name LIKE $1
    `
    const sqlParams = [`%${similarName}%`]
    const result = await pgPool.query(sql, sqlParams)
    return [result, null]
  } catch (err) {
    return [null, err]
  }
}
