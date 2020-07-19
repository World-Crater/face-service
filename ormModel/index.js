const Sequelize = require("sequelize")
const sequelize = new Sequelize(process.env.PG_SQL_DATABASE, process.env.PG_SQL_USER, process.env.PG_SQL_PASSWORD, {
  host: process.env.PG_ENDPOINT,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.facefaces = require("./facefaces.model.js")(sequelize, Sequelize)
db.faceinfos = require("./faceinfos.model.js")(sequelize, Sequelize)

module.exports = db