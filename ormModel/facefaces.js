module.exports = (sequelize, DataTypes) => {
  const FaceFaces = sequelize.define('facefaces', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    token: DataTypes.TEXT,
    preview: DataTypes.INTEGER,
    infoid: DataTypes.INTEGER,
    createdat: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdat'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedat'
    }
  }, {})
  return FaceFaces
}