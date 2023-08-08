const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  `postgres://${process.env.PG_SQL_USER}:${process.env.PG_SQL_PASSWORD}@${process.env.PG_ENDPOINT}:${process.env.PG_PORT}/${process.env.PG_SQL_DATABASE}`,
  {
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.facefaces = require("./facefaces")(sequelize, Sequelize);
db.faceinfos = require("./faceInfos")(sequelize, Sequelize);

module.exports = db;
