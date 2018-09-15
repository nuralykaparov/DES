module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  username: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  surname: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  userRoleId: {
    type: DataTypes.INTEGER,
  }
});


User.associate = function(models) {
  User.belongsTo(models.UserRole,{
    foreignKey: 'userRoleId',
  });

  User.hasMany(models.UserToDoc,{
    foreignKey: {
      name: 'id'
    }
  });

  User.hasMany(models.SendDocToUser,{
    foreignKey: {
      name: 'id'
    }
  });

  User.hasMany(models.archieve,{
    foreignKey: {
      name: 'id'
    }
  });
}

return User;
}
