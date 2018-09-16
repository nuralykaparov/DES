// For send mail
//  npm install nodemailer
var nodemailer = require('nodemailer');
var smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'tynarbekov95@gmail.com',
    pass: '6852623452marat'
  }
};


var transporter = nodemailer.createTransport(smtpConfig);
//end

var bCrypt = require('bcrypt-nodejs');
models = require('../models/');
const userToDoc = models.UserToDoc;
let sendDocToUser = models.SendDocToUser;

const Op = require("sequelize").Op;
const DocTypes = models.DocType;

var exports = module.exports = {}

//end

exports.addToArchieve = function (req, res) {
  let Archieve = models.archieve;
  data = {
    sendUserId: req.params.userId,
    docId: req.params.docId,
  }
  Archieve.create(data).then(function (create) {
    if (!create) {
      console.log("NOOOOOOOOOOOTTTTTTT           CREAAAAAAAAAAAAATED");
      res.redirect('/user/inboxDocs')
    }
    else {
      console.log("CREAAAAAAAAAAAAATED");
      res.redirect('/user/inboxDocs')
    }
  })
}

exports.archieve = function (req, res) {
  let Archieve = models.archieve;
  let User = models.User;
  let UserToDoc = models.UserToDoc;
  let arr = [];
  let docIds = [];
  Archieve.findAll().then(function (data) {
    for (var i = 0; i < data.length; i++) {
      arr.push(data[i].sendUserId);
      docIds.push(data[i].docId);
    }
    UserToDoc.findAll({where: {id: {[Op.in]: docIds}}}).then(function (docs) {
      User.findAll({where: {id: {[Op.in]: arr}}}).then(function (userList) {
        User.findOne({where: {id: req.user.id}}).then(function (user) {
          res.render('user/archive', {
            d: data,
            archive: docs,
            userList: userList,
            user: user
          })
        })
      })
    })
  })
}

exports.createDocToUser = function (req, res) {
  let userId = req.body.userId;
  let docId = req.body.docId;
  let sendUserId = req.user.id;

  data = {
    sendUserId: sendUserId,
    getUserId: userId,
    docId: docId
  }

  console.log("----------------------")
  console.log(data)


  sendDocToUser.create(data).then(function (create) {
    if (!create) {
      console.log("error: --------------" + create);
      res.redirect("/user/myDocs")
    }
    else {
      console.log('Created----------------');
      res.redirect("/user/myDocs")
    }
  })
}

exports.search = function (req, res) {
  let User = models.User;
  let Archieve = models.archieve;
  let text = req.body.search;
  let UserToDoc = models.UserToDoc;
  // Archieve.findOne()
  User.findOne({where: {id: req.user.id}}).then(function (userInfo) {
    UserToDoc.findOne({where: {name: text}}).then(function (findedDoc) {
      if (!findedDoc) {
        UserToDoc.findAll({where: {name: {like: text[0] + '%'},}}).then(function (second) {
          console.log("MUSt");
          console.log(second);
          res.render('user/search', {
            user: userInfo,
            must: second
          })
        })
      }
      else {
        Archieve.findOne({where: {docId: findedDoc.id}}).then(function (archDoc) {
          User.findOne({where: {id: archDoc.sendUserId}}).then(function (user1) {
            if (archDoc) {
              res.render('user/search', {
                id: findedDoc['id'],
                name: findedDoc['name'],
                path: findedDoc['url'],
                sendUser: user1,
                user: userInfo
              })
            }
            else {
              res.render('user/search')
            }
          })
        })
      }
    })
  })

}

// exports.inboxDocs = function(req,res){
//   let userId = req.user.id;
//   let User = models.User;
//   let UserToDoc = models.UserToDoc;
//   // let userIds = []
//   // let docIds = [];
//   // let userArr = [];
//   // let data = []
//   let allDocs = [];
//   let docList = [];
//   let userArr = [];
//   let arr = [];
//   let a = ['1']
//
//   sendDocToUser.findAll({where:{getUserId:userId}}).then(function(docList){
//     for (var i = 0; i < docList.length; i++) {
//       arr.push(docList[i].docId);
//     }
//
//     userToDoc.findAll({where:{id: {[Op.in]: arr} }}).then(function(allDocs){
//       for (var i = 0; i < allDocs.length; i++) {
//         userArr.push(allDocs[i].userId);
//       }
//       User.findAll({where:{id: {[Op.in]: userArr} }}).then(function(userList){
//
//         User.findOne({where:{id:userId}}).then(function(u){
//           res.render('user/inboxDocs',{
//             docList: allDocs,
//             userList: userList,
//             sendUser: docList,
//             user1: userId,
//             user: u,
//             a1: a
//
//           })
//         })
//       })
//     })
//   })
// }
exports.inboxDocs = function (req, res) {
  let userId = req.user.id;
  let User = models.User;
  let UserToDoc = models.UserToDoc;
  // let userIds = []
  // let docIds = [];
  // let userArr = [];
  // let data = []
  let allDocs = [];
  let docList = [];
  let userArr = [];
  let arr = [];
  let a = ['1']

  sendDocToUser.findAll({
    where: {getUserId: userId},
    // attributes:["id"],
    include: [{
      model: models.UserToDoc,
      // attributes: ["id","url","name"],
      on: {id: {$eq: models.sequelize.col('SendDocToUser.docId')}},
      include: [{
        model: models.User,
        // attributes: ["id","name","surname"],
        on: {id: {$eq: models.sequelize.col("UserToDoc.userId")}}
      }]
    }],
  }).then(function (sendDocList) {
    console.log(sendDocList);
    User.findOne({where: {id: req.user.id}}).then(function (user1) {
      res.render('user/inboxDocs', {
        text: sendDocList,
        user: user1
      });
    })
  });
}


// accessLevel: {[Op.gt]: userRole.get().accessLevel}

exports.myDocs = function (req, res) {
  let User = models.User;
  userToDoc.findAll({where: {userId: req.user.id}}).then(function (docList) {
    User.findAll({where: {id: {[Op.ne]: req.user.id}}}).then(function (userList) {
      User.findOne({where: {id: req.user.id}}).then(function (user) {
        DocTypes.findAll().then((docTypes) => {
          res.render('user/myDocs', {
            docTypes: docTypes,
            docList: docList,
            userList: userList,
            user: user
          });
        })
      })
    })
  })
};


exports.documentDelete = (req, res) => {
  const docId = req.params.docId;
  console.log(docId);
  console.log('-----------');
  console.log(userToDoc);
  userToDoc.destroy({where: {id: docId}}).then(() => {
    res.redirect('/user/myDocs')
  })
};

exports.profile = function (req, res) {
  let userId = req.params.id;
  let User = models.User;
  User.findOne({where: {id: userId}}).then(function (user) {
    res.render('user/profile', {
      user: user
    })
  })
}

exports.downloadDoc = function (req, res) {
  // res.download(__dirname + '/upload/mysql.sh','mysql.sh')
  userToDoc.findOne({where: {id: req.params.docId}}).then(function (doc) {
    console.log("DOCUMENT URLLLLLLLLLL ___________________________-")
    console.log(doc.url)
    res.download(doc.url)
  })
}

exports.createDocsView = function (req, res) {
  DocTypes.findAll().then((docTypeList) => {
    res.render('user/createDocsView', {
      user: req.user,
      docTypeList: docTypeList
    });
  });
}


exports.createDocs = function (req, res) {
  if (req.files.upfile) {
    const userId = req.user.id;
    const docName = req.body.name;
    const docTypeId = req.body.docTypeId;
    const docDescription = req.body.description;

    let file = req.files.upfile,
      name = file.name,
      type = file.mimetype;

    let uploadpath = __dirname + '/upload/' + name;

    file.mv(uploadpath, function (err) {
      if (err) {
        console.log("File Upload Failed", name, err);
        res.send("Error Occured!")
      }
      else {
        console.log(uploadpath)
        data = {
          userId: userId,
          url: uploadpath,
          name: docName,
          description: docDescription,
          docTypeId: docTypeId
        }
        userToDoc.create(data).then(function (create) {
          if (create) {
            console.log("CREATED");
            res.redirect('/user/createDocsView');
          }
          else if (!created) {
            res.render('user/createDocsView');
            console.log("NOT CREATED");
          }
        })
        console.log("File Uploaded", name);
        // res.send('Done! Uploading files')
      }
    });
  }
  else {
    res.send("No File selected !");
    res.end();
  }
}

exports.createUserView = function (req, res) {
  var UserRole = models.UserRole;
  let User = models.User;

  UserRole.findOne({
    where: {
      id: req.user.userRoleId,
    }
  }).then(function (role) {
    UserRole.findAll().then(function (list) {
      User.findOne({where: {id: req.user.id}}).then(function (user) {
        str = JSON.stringify(list, null, 4);
        res.render('user/createUser', {
          pageTitle: "CreateUser",
          "rolesList": list,
          user: user
        })
      })
    });
    return;
  });
}

exports.accessProblem = function (req, res) {
  res.render("errors/accessProblem", {pageTitle: "OOPS!"})
}

exports.createUser = function (req, res) {
  var password = generateHash(req.body.password);
  var userData = {
    username: req.body.username,
    password: password,
    userRoleId: parseInt(req.body.roleId),
    name: req.body.name,
    surname: req.body.surname,
  }
  console.log(userData);
  console.log('-------------------');
  userData.password = userData.password.trim();
  userData.username = userData.username.trim();

  userData.username = userData.username.length == 0 ? "" : userData.username.trim();
  userData.password = userData.password.length == 0 ? "" : userData.password;

  str = JSON.stringify(userData, null, 4);

  if (userData.username == "" || userData.password == "") {
    res.render('/user/createUser', {
      pageTitle: "Create user",
      "newUser": userData,
      'message': 'Please enter all the required data!!!'
    });
  }

  var userId = req.user.id

  //Check for accessLevel
  if (userId <= userData.userRoleId) {
    var User = models.User;
    User.create(userData).then(function (newUser, created) {
      if (!newUser) {
        res.render('/user/createUser', {
          pageTitle: "Create user",
          "newUser": userData,
          'message': "You couldn't be created"
        });
      }
      if (newUser) {
        console.log(newUser.branchId);
        req.flash('infoMessage', 'User created successsfulle');
        res.redirect('/');

        // Send mail
        var mailOptions = {
          from: 'tynarbekov95@gmail.com',
          to: newUser.email,
          subject: 'Explain for Authorize for abacus.kg',
          text: "Your username is: " + newUser.username + ", and password is: " + req.body.newPassword
        }

        transporter.sendMail(mailOptions, function (err, res) {
          if (err) {
            console.log('Error')
          }
          else {
            console.log('Email send')
          }
        });
        //end send mail

      }
    });
  }

  else {
    req.flash('infoMessage', 'You can not create user with bigger access level');
    res.redirect('/');
  }
}

function generateHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
}

//See all users by userRoleId
exports.getUserList = function (req, res) {
  var User = models.User;

  User.findAll({
    where: {
      userRoleId: req.params.userRoleId
    }
  }).then(function (users) {
    res.render('user/userList', {pageTitle: "All Users", userList: users});
  })
}
//Page of all user roles
exports.allUsers = function (req, res) {
  console.log("-------------IN ALLUSERS");
  res.render('user/allUsers', {pageTitle: "All users"});
};

// See user by ID
exports.getUserbyId = function (req, res) {
  // var User = models.User;
  // User.findOne({
  //   where:{
  //     id: req.params.id
  //   }
  // }).then(function(resultUser){
  //   if(!resultUser){
  //     res.render('user/showUser', {errorMessage:'User not found'});
  //   }
  //   res.render('user/showUser',{user: resultUser});
  // });

  let av = 0;
  let maxLevel = 0;
  let User = models.User;
  let Subject = models.Subject;
  Subject.max('level').then(function (max) {
    maxLevel = max;
    console.log(maxLevel);
  }).then(function () {
    User.findOne({where: {id: req.params.id}}).then(function (resultUser) {
      if (resultUser.level != 1) {
        av = (maxLevel - resultUser.level) * 10;
        res.render('user/showUser', {user: resultUser, average: av});
      }
      else {
        res.render('user/showUser', {user: resultUser, average: 100});
      }

    })
  })
}
//EditView user information
exports.editUserView = function (req, res) {
  var User = models.User;
  var UserRole = models.UserRole;
  var userRoleList = {};
  UserRole.findOne({
    where: {
      id: req.user.userRoleId,
    }
  }).then(function (userRole) {
    UserRole.findAll({
      where: {
        accessLevel: {[Op.gt]: userRole.get().accessLevel}
      }
    }).then(function (roleList) {
      userRoleListStr = JSON.stringify(roleList, null, 4);
      User.findOne({
        where: {
          id: req.params.id
        }
      }).then(function (userResult) {
        if (!userResult) {
          res.render('user/showUser', {errorMessage: 'User not found'});
        }
        res.render('user/editUser', {user: userResult, rolesList: roleList});
      });
    });

  });
};
// Edit user information
exports.editUser = function (req, res) {
  var userData = {
    name: req.body.name,
    surname: req.body.surname,
    username: req.body.username,
    email: req.body.email,
  }

  userData.username = userData.username.trim();
  userData.username = userData.username.length == 0 ? "" : userData.username.trim();

  str = JSON.stringify(userData, null, 4);

  var User = models.User;
  User.findOne({
    where: {
      id: req.params.id,
    }
  }).then(function (user) {
    user.updateAttributes(userData).then(function (editUser) {
      if (!editUser) {
        res.redirect('/');
      }
      if (editUser) {
        console.log("YES<< UPDATED");
        req.flash('infoMessage', 'User updated');
        res.redirect('/user/profile/' + editUser.id);
      }
    });
  });

}
// Destroy User
exports.destroyUser = function (req, res) {
  var User = models.User;
  User.destroy({
    where: {
      id: req.params.id
    }
  }).then(function () {
    req.flash('infoMessage', 'User destroy');
    res.redirect('/');
  });
}

// Edit User Password View
exports.editPasswordUserView = function (req, res) {
  User = models.User;
  User.findOne({
    where: {
      id: req.params.id
    }
  }).then(function (resultUser) {
    if (!resultUser) {
      res.flash('infoMessage', 'User not found');
      res.render('/');
    }
    res.render('user/editPasswordUser', {user: resultUser});
  });
}


exports.editPasswordUser = function (req, res) {

  console.log(req.body.newPassword);
  password = generateHash(req.body.newPassword);
  console.log(password);
  var userData = {
    password: password
  }
  User = models.User;
  User.findOne({
    where: {
      id: req.params.id
    }
  }).then(function (user) {
    user.updateAttributes(userData).then(function (editUser) {
      if (!editUser) {
        res.flash('infoMessage', 'User not updated');
        res.render('/');
      }
      if (editUser) {
        req.flash('infoMessage', 'User password updated');
        res.redirect('/user/profile/' + editUser.id);
      }
    });
  });
}


//Reset password
exports.resetPassword = function (req, res) {
  var User = models.User;
  username = req.body.userName;
  phone = req.body.phone;

  User.findOne({
    where: {
      username: username,
      phone: phone
    }
  }).then(function (data) {
    if (data == null) {
      asd = "Введенный логин или номер телефона не совпадают! ПОЖАЛУЙСТА,Убедитесь в правильности введенных данных.";
      res.render('auth/forgot', {
        data_error: asd
      });
    }
    else if (data != null) {

      data1 = "На вашу почту выслан новый пароль. Проверьте вашу почту.";
      var newPassword = getRandom();
      resetPassword(data, newPassword);
      console.log("NEW PASSWORD: " + newPassword);
      var mailOptions = {
        from: 'tynarbekov95@gmail.com',
        to: data.email,
        subject: 'Ваш новый пароль от abacus.kg',
        text: "Ваш логин: " + data.username + ", Ваш новый пароль: " + newPassword
      }
      transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
          console.log('Error')
        }
        else {
          console.log('Email send')
        }
      });
      res.render('auth/forgot', {
        data: data1
      });
    }
  })
}

function getRandom() {
  return Math.floor(Math.random() * 900000) + 100000;
}

//Reset Passsword
function resetPassword(user, newPassword) {
  User = models.User;
  password = generateHash(newPassword);
  return User.find({
    where: {
      id: user.id
    }
  }).then(function (data) {
    data.updateAttributes({
      password: password
    }).then(function (save) {
      if (save) {
        console.log("Updated");
      }
      else {
        console.log("Not Updated");
      }
    })
  })
}

exports.myUsers = function (req, res) {
  var User = models.User;
  userId = req.user.id

  User.findOne({
    where: {
      id: userId
    }
  }).then(function (data) {
    User.findAll({
      where: {
        branchId: data.branchId,
      }
    }).then(function (result) {
      res.render('user/myUsers', {
        users: result
      });
    });
  })
}

exports.editCurrentPassword = function (req, res) {
  let User = models.User;
  User.findOne({
    where: {
      id: req.user.id
    }
  }).then(function (user) {
    res.render('user/editCurrentPassword', {
      user: user
    })
  })

}

exports.editCurrentPasswordPost = function (req, res) {
  let userId = req.user.id;
  let User = models.User;
  let oldPassword = generateHash(req.body.oldPassword);
  let newPassword = generateHash(req.body.newPassword);
  let repeatNewPassword = generateHash(req.body.repeatNewPassword);
  console.log("old password    " + oldPassword);
  console.log("new password     " + newPassword);
  console.log("repeatNewPassword    " + repeatNewPassword);

  User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    if (user.password == oldPassword && newPassword == repeatNewPassword) {
      user.updateAttributes({
        password: newPassword
      }).then(function () {
        console.log("IN TRUE");
        req.flash("Вы изменили пароль")
        res.render('user/editCurrentPassword', {
          user: user
        });
      })
    }
    else {
      console.log("IN FALSE");
      req.flash("Не получилось Изменит Пароль")
      res.render('user/editCurrentPassword', {
        user: user
      });
    }
  })
}


//
