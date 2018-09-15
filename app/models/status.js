module.exports = function(sequelize, DataTypes) {
    var Status = sequelize.define('Status', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Status.associate = function(models) {
        Status.hasMany(models.SendDocToUser,{
            foreignKey: {
                name: 'id',
            }
        });
    };

    return Status;
};
