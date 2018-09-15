module.exports = function(sequelize, DataTypes) {
    var DocType = sequelize.define('DocType', {
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

    DocType.associate = function(models) {
        DocType.hasMany(models.SendDocToUser,{
            foreignKey: {
                name: 'id',
            }
        });
    };

    return DocType;
};
