var exports = module.exports = {}

exports.index = function(req,res){
  res.render('index',{pageTitle: "Home Page",user: req.user,message: req.flash('infoMessage')});
};
