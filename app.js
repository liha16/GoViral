/**
 * The starting point of the application.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

require('dotenv').config() // The credentials file

const errors = require('http-errors')
const express = require('express')
const hbs = require('express-hbs')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const mongoose = require('./configs/mongoose')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const app = express()

// connect to db
mongoose.connect().catch(error => {
  console.error(error)
  process.exit(1)
})

// view engine setup
app.engine('hbs', hbs.express4({
  defaultLayout: path.join(__dirname, 'views', 'layouts', 'default'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views')) // links to views folder

// middlewares
app.use(logger('dev')) // get info in console
app.use(helmet()) // to protect from xss
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'https://www.google.com/', 'http://www.google.com/'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'cdnjs.cloudflare.com'],
    imgSrc: ["'self'"],
    scriptSrc: ["'self'", 'cdnjs.cloudflare.com', "'unsafe-inline'", 'https://www.gstatic.com/', 'https://connect.facebook.net/', 'https://www.google.com/', 'http://www.google.com/'],
    styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', 'https://fonts.googleapis.com']
  }
}))
app.use(express.urlencoded({ extended: false })) // to get data of post
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json()) // parse application/json
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  name: 'goviralevents',
  secret: '1234567890',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}))
app.use((req, res, next) => { // flash messages
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }
  res.locals.session = req.session
  next()
})

app.set('trust proxy', true) // to get ip adress of client

// routes
app.use('/', require('./routes/homeRouter'))
app.use('/events', require('./routes/eventsRouter'))
app.use('/users', require('./routes/usersRouter'))
app.use('*', (req, res, next) => next(errors(404)))

app.use((err, req, res, next) => {
  if (err.status === 404) {
    return res
      .status(404)
      .sendFile(path.join(__dirname, 'views', 'error', '404.html'))
  }
  if (err.status === 403) {
    return res
      .status(403)
      .sendFile(path.join(__dirname, 'views', 'error', '403.html'))
  }
})

// listening
app.listen(8080, () => console.log('Server running at http://localhost:8080/'))

module.exports = app // for testing
