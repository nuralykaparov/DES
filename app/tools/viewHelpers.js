var exports = module.exports = {};
let generalController = require("./../controllers/generalFunctions");
let uRVars = require("./UserRoleVariables");
exports.if_eq = function (a, b, opts) {
  if (a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
};
exports.if_gte = function(a, b, opts) {
  if(a >= b)
    return opts.fn(this);
  return opts.inverse(this);
};
exports.if_gt = function(a, b, opts) {
  if(a > b)
    return opts.fn(this);
  return opts.inverse(this);
};
exports.if_lte = function(a, b, opts) {
  if(a <= b)
    return opts.fn(this);
  return opts.inverse(this);
};
exports.if_lt = function(a, b, opts) {
  if(a < b)
    return opts.fn(this);
  return opts.inverse(this);
};
