var exports = module.exports = {}

exports.signin = function(req,res){
  res.render('auth/signIn',{pageTitle: "SignIn", message: req.flash('loginMessage') });
};

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}
exports.notAuthorized = function(req, res) {
    res.redirect('/signIn');
}

exports.forgotPassword = function(req,res){
  res.render('auth/forgot');
}
