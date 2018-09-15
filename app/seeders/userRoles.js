module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("UserRoles",[
      {name: "admin",accessLevel: 1, createdAt: new Date(), updatedAt: new Date()},
      {name: "user",accessLevel: 2, createdAt: new Date(), updatedAt: new Date()},
    ]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("UserRoles");
  }
};
