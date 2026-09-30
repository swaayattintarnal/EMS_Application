require('dotenv').config();

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

// MongoDB Connection

const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
};

async function connectMongoDB() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);

    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);

    process.exit(1);
  }
}

connectMongoDB();

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

// View Engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/new_uploads',
  express.static(path.join(__dirname, 'public', 'new_uploads'))
);

// CORS

const allowedOrigins = [
  'http://localhost:3001',
  'https://ems-application-1.onrender.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', indexRouter);

// 404 Handler

app.use(function (req, res, next) {
  next(createError(404));
});

// Error Handler

app.use(function (err, req, res, next) {
  res.locals.message = err.message;

  res.locals.error =
    req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  res.render('error');
});

module.exports = app;