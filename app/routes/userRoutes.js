var userController = require('../controllers/userController.js');
var generalFunctions = require('../controllers/generalFunctions');

module.exports = function(app,passport){

  app.post('/user/search',
  userController.search);

  app.get('/user/profile/:id',
  userController.profile);

  app.get('/user/myDocs',
    userController.myDocs);

  app.get('/user/archieve',
    userController.archieve);

  app.get('/user/addToArchieve/:docId/:userId',
    userController.addToArchieve);

  app.get('/user/createDocsView',
    userController.createDocsView);

  app.get('/user/downloadDoc/:docId',
    userController.downloadDoc);

  app.get('/user/inboxDocs',
    userController.inboxDocs);

  app.post('/user/createDocs',
    userController.createDocs);

  app.post('/user/createDocToUser',
    userController.createDocToUser);


  app.get('/accessProblem',
    generalFunctions.isLoggedIn,
    userController.accessProblem);

  app.get('/user/createUser',
    generalFunctions.isLoggedIn,
    // generalFunctions.hasAdminAccess,
    userController.createUserView);
  app.post('/user/createUser',
    generalFunctions.isLoggedIn,
    // generalFunctions.hasAdminAccess,
    userController.createUser);

  app.get('/userList/:userRoleId',
    generalFunctions.isLoggedIn,
    generalFunctions.hasAdminAccess,
    userController.getUserList);
  app.get('/user/showUser/:id',
    generalFunctions.isLoggedIn,
    generalFunctions.hasAdminAccess,
    userController.getUserbyId);

  app.get('/user/editUser/:id',
    generalFunctions.isLoggedIn,
    userController.editUserView);
  app.post('/user/editUser/:id',
    generalFunctions.isLoggedIn,
    userController.editUser);

  app.get('/user/editPasswordUser/:id',
    generalFunctions.isLoggedIn,
    userController.editPasswordUserView);

  app.post('/user/editPasswordUser/:id',
    generalFunctions.isLoggedIn,
    userController.editPasswordUser);

  app.post('/user/destroyUser/:id',
    generalFunctions.isLoggedIn,
    userController.destroyUser);

  app.get('/user/allUsers',
    generalFunctions.isLoggedIn,
    generalFunctions.hasTeacherAccess,
    userController.allUsers);

  app.get('/user/myUsers',
    generalFunctions.isLoggedIn,
    generalFunctions.hasTeacherAccess,
    userController.myUsers);

  app.get('/user/editCurrentPassword/:id',
    generalFunctions.isLoggedIn,
    generalFunctions.hasAdminAccess,
    userController.editCurrentPassword);

  app.post('/user/editCurrentPassword/:id',
    generalFunctions.isLoggedIn,
    generalFunctions.hasAdminAccess,
    userController.editCurrentPasswordPost);

  app.post('/api/reset-password',
    generalFunctions.isLoggedIn,
    userController.resetPassword);
}
