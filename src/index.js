const express = require('express')
const cors = require('cors')

const serverRouter = require('./routes/serverRouter')
const domainRouter = require('./routes/domainRouter')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.port || 8080

app.use('/api/servers', serverRouter)
app.use('/api/domains', domainRouter)

app.listen(PORT, err => {
	if(!err) console.log(`Server started on port ${PORT}`)
})