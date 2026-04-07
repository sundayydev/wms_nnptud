require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')
var cors = require('cors');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/', indexRouter);

app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/auth', require('./routes/auth'));
//app.use('/api/v1/carts', require('./routes/carts'));
app.use('/api/v1/products', require('./routes/products'))
app.use('/api/v1/categories', require('./routes/categories'))
app.use('/api/v1/roles', require('./routes/roles'))
app.use('/api/v1/upload', require('./routes/upload'))
app.use('/api/v1/suppliers', require('./routes/suppliers'))
app.use('/api/v1/warehouses', require('./routes/warehouses'))
app.use('/api/v1/auditlogs', require('./routes/auditlogs'))
app.use('/api/v1/purchase-orders', require('./routes/purchaseOrders'))
app.use('/api/v1/sales-orders', require('./routes/salesorders'))
app.use('/api/v1/shipments', require('./routes/shipments'))
app.use('/api/v1/customers', require('./routes/customers'))
app.use('/api/v1/inventories', require('./routes/inventories'))
app.use('/api/v1/notifications', require('./routes/notifications'))
app.use('/api/v1/print', require('./routes/print'))
app.use('/api/v1/messages', require('./routes/messages'))
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', function () {
  console.log("connected");
})
mongoose.connection.on('disconnecting', function () {
  console.log("disconnected");
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
