module.exports = {
  up: function(queryInterface, Sequelize) {
    var pass = generateHash('password');
    return queryInterface.bulkInsert("Users",[
      {
        username: "admin",
        name: "Admin",
        surname: "Admin",
        password: pass,
        userRoleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable("Users");
  }
};

var bCrypt = require('bcrypt-nodejs');

function generateHash(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
};
