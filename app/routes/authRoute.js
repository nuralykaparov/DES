var authController = require('../controllers/authController');
// app.get('/forgot', authController.forgot);

var generalFunctions = require('../controllers/generalFunctions');
module.exports = function(app,passport) {

  app.get('/signIn', authController.signin);
  app.post('/signIn', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/signin'
  }));

  app.get('/notAuthorized',authController.notAuthorized);
  app.get('/logout', authController.logout);
  app.get('/forgotPassword',authController.forgotPassword)

};
