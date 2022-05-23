const express = require('express')
const app = express()

//imported routes
const usersRouter = require('../routes/user')
const cartRouter = require('../routes/cart')
const productsRouter = require('../routes/products')

app.use(express.json())

// app.use(routes)
app.use('/users', usersRouter)
app.use('/cart', cartRouter)
app.use('/products', productsRouter)

module.exports = app
