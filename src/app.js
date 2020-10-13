const express = require('express')
require('./db/mongoose')
const userRoute = require('../src/routers/user')
const taskRoute = require('../src/routers/task')
const app = express()

app.use(express.json())
app.use(userRoute)
app.use(taskRoute)

module.exports = app
