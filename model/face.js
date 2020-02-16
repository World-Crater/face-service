const { Pool } = require('pg')
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
