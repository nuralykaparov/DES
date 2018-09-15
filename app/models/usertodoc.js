module.exports = function(sequelize, DataTypes) {
  var UserToDoc = sequelize.define('UserToDoc', {

  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  url: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  }
  });

  UserToDoc.associate = function(models){
    UserToDoc.belongsTo(models.User,{
      foreignKey: 'userId'
    });

    UserToDoc.hasMany(models.SendDocToUser,{
      foreignKey: {
        name: 'id',
      }
    });
    UserToDoc.hasMany(models.archieve,{
      foreignKey: {
        name: 'id',
      }
    });
  }

  return UserToDoc;
};
