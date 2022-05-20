const express = require('express')
const app = express()

//imported routes
const usersRouter = require('../routes/user')

app.use(express.json())

// app.use(routes)
app.use('/users', usersRouter)

module.exports = app
