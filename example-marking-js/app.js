var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var index = require('./routes/index');
// var assess = require('./routes/assess');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
var jsonParser = bodyParser.json()
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
// app.use('/assess', assess);

/* POST /equivalence/ */
app.post('/equivalence/', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  else if (req.body.testFile === req.body.content) {
    res.json(true);
    // res.sendStatus(200);
  }
  else {
    res.json(false);
    // res.sendStatus(200);
  }  
  //res.sendStatus(418);  
})

/* POST /equivalence/ */
app.post('/equivalence/txt/', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  else if (req.body.testFile === req.body.content) {
    res.json(true);
    // res.sendStatus(200);
  }
  else {
    res.json(false);
    // res.sendStatus(200);
  }  
  //res.sendStatus(418);  
})

/* POST /mocha/ */
app.post('/mocha/', jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);
  // TODO
  res.sendStatus(418);
});

/* GET: serve index page */
app.get('/', function(req, res) {
  res.render('index', { title: 'bcu example marking' });
});

/* PUT: not allowed */
app.put('/', function (req, res) {
  res.sendStatus(405);
})

/* DELETE: not allowed */
app.delete('/', function (req, res) {
  res.sendStatus(405);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.listen(3001);

module.exports = app;
