var bCrypt = require('bcrypt-nodejs');
var models = require('../../models/');
module.exports = function(passport, user) {
  var User = user;
  var LocalStrategy = require('passport-local').Strategy;

  passport.use('local-signup',new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back entire request to the callback
    },
    function(req, username, password, done) {
      var generateHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
      };
      User.findOne({
        where: {
            username: username
        }
      }).then(function(user) {
        if (user){
            return done(null, false,
              req.flash('signupMessage', 'That username is already taken.'));
        } else{
            var userPassword = generateHash(password);
            var data = {
                    username: req.body.username,
                    password: userPassword,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    about: ""
                };
            User.create(data).then(function(newUser, created) {
                if (!newUser) {
                    return done(null, false);
                }
                if (newUser) {
                    return done(null, newUser);
                }
            });
        }
      });
    }
  ));
  //serialize
  passport.serializeUser(function(user, done) {
      done(null, user.id)
  });
  // deserialize user
  passport.deserializeUser(function(id, done) {
      User.findById(id).then(function(user) {
          if (user) {
              done(null, user.get());
          } else {
              done(user.errors, null);
          }
      });
  });

  //LOCAL SIGNIN
passport.use('local-signin', new LocalStrategy(
    {
        // by default, local strategy uses email and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        var User = user;
        var isValidPassword = function(userpass, password) {
            return bCrypt.compareSync(password, userpass);
        }
        User.findOne({
            include:[{
              model: models.UserRole,
              attributes: ['id','name','accessLevel']
            }],
            where: {
                username: username
            }
        }).then(function success(user) {
            if(!user || !isValidPassword(user.password, password)){
              console.log("FAIL!!!");
              return done(null, false, req.flash('loginMessage', 'Incorrect username/password'));
            }
            var userinfo = user.get();
              console.log("LOGIN");
            return done(null, userinfo);
        }).catch(function(err) {
            console.log("Error:", err);
            return done(null, false, {
                message: 'Something went wrong with your Signin'
            });
        });
    }
));
}
