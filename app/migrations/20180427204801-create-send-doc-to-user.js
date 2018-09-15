'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('SendDocToUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      msg: {
        type: Sequelize.STRING
      },
      sendUserId:{
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      getUserId:{
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      docId:{
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'UserToDocs',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('SendDocToUsers');
  }
};
