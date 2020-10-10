const express = require('express')
require('./db/mongoose')
const userRoute = require('../src/routers/user')
const taskRoute = require('../src/routers/task')
const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(userRoute)
app.use(taskRoute)

app.listen(port, () => {
	console.log('Server is up on ' + port)
})
