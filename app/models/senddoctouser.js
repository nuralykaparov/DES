module.exports = function (sequelize, DataTypes) {
    var SendDocToUser = sequelize.define('SendDocToUser', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        msg: {
            type: DataTypes.STRING,
        }
    });
    SendDocToUser.associate = function (models) {
        SendDocToUser.belongsTo(models.User, {
            foreignKey: 'sendUserId'
        });

        SendDocToUser.belongsTo(models.Status, {
            foreignKey: 'statusId',
        });

        SendDocToUser.belongsTo(models.DocType, {
            foreignKey: 'docTypeId',
        });

        SendDocToUser.belongsTo(models.User, {
            foreignKey: 'getUserId'
        });

        SendDocToUser.belongsTo(models.UserToDoc, {
            foreignKey: 'docId'
        });
    }
    return SendDocToUser;
};
