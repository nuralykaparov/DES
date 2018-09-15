var express    = require('express');
var app        = express();
var passport   = require('passport');
var session    = require('express-session');
var bodyParser = require('body-parser');
var env        = require('dotenv').load();
var exphbs     = require('express-handlebars');
var flash      = require('connect-flash');
var upload = require('express-fileupload');

const path = require('path');
const port = 3000;

app.use(express.static(__dirname + '/upload'));
app.use(upload()); // configure middleware

// bodyParser
// app.use(express.bodyParser({uploadDir:'/home/tm/Desktop/abacus/app/upload/trophies'}));
// app.use(bodyParser({ uploadDir: path.join(__dirname, 'upload/files'), keepExtensions: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// passport
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(express.static(path.join(__dirname, '/views/src/')));

// call helper for viewHelpers
exhbsHelper = require("./app/tools/viewHelpers");
var hbs = exphbs.create({
  helpers: {
    //create helper,call exhbsHelper
    if_eq: exhbsHelper.if_eq,
    if_gte: exhbsHelper.if_gte,
    if_gt: exhbsHelper.if_gt,
    if_lt: exhbsHelper.if_lt,
    if_lte: exhbsHelper.if_lte,
    accessLevel: exhbsHelper.accessLevel,
  },
  defaultLayout: 'main',
  extname: '.hbs'
});

// Handlebars.registerHelper('for', function(from, to, incr, block) {
//     var accum = '';
//     for(var i = from; i < to; i += incr)
//         accum += block.fn(i);
//     return accum;
// });



// Handlebars
app.set('views', './app/views')
// app.engine('hbs',exphbs({defaultLayout: 'main',extname: '.hbs'}));
app.engine('hbs',hbs.engine)
// app.engine('defaultLayout','hbs')
app.set('view engine', 'hbs');



// models
var models = require("./app/models");

// load passport strategies
require('./app/config/passport/passport.js')(passport,models.User);
// routes
var authRoute = require('./app/routes/authRoute.js')(app,passport);
var basicRoutes = require('./app/routes/basicRoutes.js')(app);
var userRoute = require('./app/routes/userRoutes.js')(app);
// var userRouteAPI = require('./app/routes/api/userAPI.js')(app);
// var arithmeticsRoutes = require('./app/routes/arithmeticsRoutes.js')(app);
// var arithmeticsAPI = require('./app/routes/api/arithmeticsAPI.js')(app);
// var ajaxRequest = require('./app/routes/ajaxRequest.js')(app);
// var games = require('./app/routes/games.js')(app);
// var olympiadRoutes = require('./app/routes/olympiadRoutes.js')(app);
// var olympiadAPIRoutes = require('./app/routes/api/olympiadAPI.js')(app);
// require('./app/routes/olympiad/olympiadResultRoutes')(app);
// var userToOlympiad = require('./app/routes/olympiad/userToOlympiad.js')(app);

// sync Database
models.sequelize.sync().then(function(){
  console.log('Nice! Database looks fine')
}).catch(function(err){
  console.log(err,"Something went wrong with the Database Update!")
});

app.listen(port, function(err){
  if(!err)
    console.log("Site is live at port: "+port); else console.log(err)
});
