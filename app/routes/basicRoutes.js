basicController = require('../controllers/basicController')

var authController = require('../controllers/authController');
var generalFunctions = require('../controllers/generalFunctions');
module.exports = function(app) {
  app.get('/', generalFunctions.isLoggedIn, basicController.index);
};
