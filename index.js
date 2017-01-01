var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');


var routes = require('./routes/index');
var users = require('./routes/users');
var designRouter = require('./routes/designRouter');

var mongoose = require('mongoose'),
    assert = require('assert');

var Designs = require('./models/designs');

// read the templates and designer
var templateFile = './public/design/templates/templates.json';
var templateJson = jsonfile.readFileSync(templateFile);
console.log("json:"+templateJson.templates[0].name+","+templateJson.templates[0].gid+","+templateJson.templates[0]["0010001"]);
console.log("json:"+templateJson.templates[1].name+","+templateJson.templates[1].gid+","+templateJson.templates[1]["0020001"]);
console.log("json:"+templateJson.templates[2].name+","+templateJson.templates[2].gid+","+templateJson.templates[2]["0030001"]);
var designerFile = './public/design/designer.json';
var designerJson = jsonfile.readFileSync(designerFile);
console.log("designer json:"+designerJson.designs[0].name+","+designerJson.designs[0].did);

var url = 'mongodb://dbuser:dbuser@ds019054.mlab.com:19054/jitdiy';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log("Connected correctly to server");
  /**  // create a new design
   var newDesign = Designs({
    id: '123',
    designId: 'Test'
  });

   // save the design
   newDesign.save(function (err) {
    if (err) throw err;
    console.log('Design created!');

    // get all the designs
    Designs.find({}, function (err, designs) {
      if (err) throw err;

      // object of all the designs
      console.log(designs);
      db.collection('designs').drop(function () {
        db.close();
      });
    });
  });**/
});

var app = express();
// if use proxy, trust proxy for ip etc.
app.enable('trust proxy');

app.set('templates',templateJson);
app.set('designer', designerJson);

// view engine setup
var handlebars = require('express3-handlebars').create({
  defaultLayout:'main',
  helpers: {
    section: function(name, options){
      if(!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    static: function(name) {
      return require('./lib/static.js').map(name);
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/design',designRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
