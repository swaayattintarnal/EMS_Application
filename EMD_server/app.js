const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');



const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EMD_DB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Specifically serve files from 'public/new_uploads' under the /new_uploads route
app.use('/new_uploads', express.static(path.join(__dirname, 'new_uploads')));

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', indexRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;