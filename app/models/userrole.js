module.exports = function(sequelize, DataTypes) {
  var UserRole = sequelize.define('UserRole', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    accessLevel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  UserRole.associate = function(models) {
    UserRole.hasMany(models.User,{
      foreignKey: {
        name: 'id',
      }
    });
  };

  return UserRole;
};
