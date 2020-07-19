module.exports = (sequelize, DataTypes) => {
  const FaceInfos = sequelize.define('faceinfos', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: DataTypes.TEXT,
    romanization: DataTypes.TEXT,
    detail: DataTypes.TEXT,
    preview: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdat'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedat'
    }
  }, {})
  return FaceInfos
}