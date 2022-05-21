const express = require('express')
const app = express()

//imported routes
const usersRouter = require('../routes/user')
const cartRouter = require('../routes/cart')

app.use(express.json())

// app.use(routes)
app.use('/users', usersRouter)
app.use('/cart', cartRouter)

module.exports = app
