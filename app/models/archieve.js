module.exports = function(sequelize, DataTypes) {
  var archieve = sequelize.define('archieve', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING
    }
  });

  archieve.associate = function(models){
    archieve.belongsTo(models.User,{
      foreignKey: 'sendUserId'
    });
    archieve.belongsTo(models.UserToDoc,{
      foreignKey: 'docId'
    });
  }

  return archieve;
};
