const express = require('express')
const cors = require('cors')

const serverRoute = require('./routes/serverRoute')
const domainRoute = require('./routes/domainRoute')
const seedRoute = require('./routes/seedRoute')
const checkRoute = require('./routes/checkRoute')

const connection = require('./db')
const DomainIterator = require('./DomainIterator')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8080

app.use('/api/servers', serverRoute)
app.use('/api/domains', domainRoute)
app.use('/api/seeds', seedRoute)
app.use('/api/checks', checkRoute)

let progressResult = {}
let stop = false
let interval

app.post('/api/checkStart', (req, res) => {
	stop = false

	const serverList = [
		'https://domain-name-server-1.herokuapp.com',
		'https://domain-name-server-2.herokuapp.com',
		'https://domain-name-server-3.herokuapp.com'
	]

	connection.query('SELECT domain_name from domains', (err, results, fields) => {
		const domainList = results.map(row => row.domain_name)

		const domainIterator = DomainIterator(domainList, serverList)

		interval = setInterval(() => {

			if(domainIterator.hasNext()) {
				domainIterator.saveToDatabase(() => {
					progressResult = domainIterator.getProgressResult()
				})
			} else {
		       clearInterval(interval)
		    }

		}, 1050/serverList.length)

		res.send({ status: 200 })
	})
})

app.post('/api/checkStop', (req, res) => {
	stop = true
	clearInterval(interval)
	res.send({ status: 200 })
})

app.get('/api/checkProgress', (req, res) => {
	res.send(progressResult)
})

app.listen(PORT, err => {
	if(!err) console.log(`Server started on port ${PORT}`)
})