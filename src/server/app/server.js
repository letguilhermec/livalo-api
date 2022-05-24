const express = require('express')
const app = express()

require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')

//imported routes
const usersRouter = require('../routes/user')
const cartRouter = require('../routes/cart')
const productsRouter = require('../routes/products')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true,
}))
app.use(cors())
app.use(session({
    secret: process.env.COOKIE_SECRET,
  credentials: true,
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.ENVIRONMENT === 'production',
    httpOnly: true,
    sameSite: process.env.ENVIRONMENT ? "none" : "lax",
  },
}))

// app.use(routes)
app.use('/users', usersRouter)
app.use('/cart', cartRouter)
app.use('/products', productsRouter)

module.exports = app
