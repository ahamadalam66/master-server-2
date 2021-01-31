const express = require('express')

const connection = require('../db')

const router = express.Router()

// GET All server
router.get('/', (req, res) => {
	let { range } = req.query
	range = JSON.parse(range)
	
	const sql = `SELECT *, COUNT(*) OVER() AS total_count FROM servers LIMIT ${range[1] -range[0]} OFFSET ${range[0]}`;

	connection.query(sql, (err, results, fields) => {
		res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
		if(results.length) {
			res.setHeader('Content-Range', `domains ${range[0]}-${range[1]}/${results[0].total_count}`)
		}
		else {
			res.setHeader('Content-Range', 'domain 0-0/0')
		}
		res.send(results) 
	})
})

// GET one server
router.get('/:id', (req, res) => {
	const sql = `SELECT * FROM servers WHERE id = '${req.params.id}'`

	connection.query(sql, (err, results, fields) => {
		res.send(results[0]) 
	})
})

// GET many server
// router.get('/', (req, res) => {
// 	let { filter } = req.query
// 	filter = JSON.parse(filter)

// 	const sql = `SELECT *, COUNT(*) OVER() AS total_count FROM servers LIMIT ${range[1] -range[0]} OFFSET ${range[0]}`;

// 	connection.query(sql, (err, results, fields) => {
// 		res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
// 		res.setHeader('Content-Range', `servers 0-2/${results[0].total_count}`)
// 		res.send(results) 
// 	})
// })

// Create server 
router.post('/', (req, res) => {
	const sql = `INSERT INTO servers (server_name) VALUES ('${req.body.server_name}')`

	connection.query(sql, (err, results, fields) => {
		res.send({ id: results.insertId }) 
	})
})

// Update server
router.put('/:id', (req, res) => {
	const sql = `UPDATE servers SET server_name = '${req.body.server_name}' WHERE id = '${req.params.id}'`

	connection.query(sql, (err, results, fields) => {
		res.send(req.body) 
	})
})

// Delete a server
router.delete('/:id', (req, res) => {
	const sql = `DELETE FROM servers WHERE id = '${req.params.id}'`

	connection.query(sql, (err, results, fields) => {
		res.send(req.params.id) 
	})
})

// Delete many server
router.delete('/', (req, res) => {
	const { filter } = req.query
	const { id } = JSON.parse(filter)

	const sql = `DELETE FROM servers WHERE id IN (${id.join(', ')})`

	connection.query(sql, (err, results, fields) => {
		res.send(id)
	})
})

module.exports = router
