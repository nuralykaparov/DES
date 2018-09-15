var exports = module.exports = {};
let models = require("./../models");
let UserRole = models.UserRole;
let uRVars = require("./../tools/UserRoleVariables");

exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/notAuthorized');
};

exports.hasSolveAccess = function(req,res){
  if (req.user.userRoleId == 1 || req.user.userRoleId == 2 || req.user.userRoleId == 7) {
    return true;
  }
  else {
    return false;
  }
}

exports.hasSuperAdminAccess = function (req,res,next){
    hasAccessLevel(req.user,uRVars.superAdmin()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});};

exports.hasAdminAccess = function(req,res,next) {
    hasAccessLevel(req.user,uRVars.administrator()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasManagerAccess = function(req,res,next){
    hasAccessLevel(req.user,uRVars.manager()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasTeacherAccess = function(req,res,next){
    hasAccessLevel(req.user,uRVars.teacher()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasMasterFranchiseCountryAccess = function(req,res,next){
    hasAccessLevel(req.user,uRVars.masterFranchiseCountry()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasMasterFranchiseRegionAccess = function(req,res,next){
    hasAccessLevel(req.user,uRVars.masterFranchiseRegion()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasStudentAccess = function(req,res,next){
    hasAccessLevel(req.user,uRVars.student()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasStudentAccessOnly = function(req,res,next){
    hasAccessLevelOnly(req.user,uRVars.student()).then(function(value) {
        if (value) {
            return next();
        }else{
            res.redirect('/accessProblem');
        }
    }).catch(function(){ res.redirect('/accessProblem')});
};

exports.hasAccessLevel = function (user, level) {
  return hasAccessLevel(user,level);
};

function hasAccessLevel(user, level) {
    return UserRole.findAll().then(function (data) {
        let currentRole = getRoleById(data,user.userRoleId);
        let neededRole = getRoleByName(data,level);
        return currentRole.accessLevel <= neededRole.accessLevel;
        // return currentRole.accessLevel <= neededRole.accessLevel;
    });
}

function hasAccessLevelOnly(user, level) {
    return UserRole.findAll().then(function (data) {
        let currentRole = getRoleById(data,user.userRoleId);
        let neededRole = getRoleByName(data,level);
        return currentRole.accessLevel == neededRole.accessLevel;
    });
}

function getRoleById(roleList,roleId){
    if(isNull(roleList) || isNull(roleId))
        return null;
    for(let role of roleList){
        if(isNull(role)){
            continue;
        }
        if(role.id == roleId){
            return role;
        }
    }
}

function getRoleByName(roleList,roleName){
    if(isNull(roleList) || isNull(roleName))
        return null;
    for(let role of roleList){
        if(isNull(role)){
            continue;
        }
        if(role.name == roleName){
            return role;
        }
    }
    return null;
}

function isNull(value) {
    return value === null || value === undefined;
}
