const express = require('express')

const connection = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
	let { filter, range, sort } = req.query

	filter = JSON.parse(filter)
	range = JSON.parse(range)
	sort = JSON.parse(sort)

	let sql = ''

	if(filter['q'] && filter['select'] && filter['date']) {

		switch(filter['select']) {
			case "deactivated": 
				sql = `SELECT *, COUNT(*) OVER() AS total_count 
				FROM checks 
				WHERE public_domain_status = 'H' && date = '${filter['date']}' && domain LIKE '%${filter['q']}%' 
				ORDER BY ${sort[0]} ${sort[1]} 
				LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
				break;

			case "deleted": 
				sql = `SELECT *, COUNT(*) OVER() AS total_count 
				FROM checks 
				WHERE status = 404 && date = '${filter['date']}' && domain LIKE '%${filter['q']}%' 
				ORDER BY ${sort[0]} ${sort[1]} 
				LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
				break;

			default:
				sql = `SELECT *, COUNT(*) OVER() AS total_count 
				FROM checks 
				WHERE date = '${filter['date']}' && domain LIKE '%${filter['q']}%' 
				ORDER BY ${sort[0]} ${sort[1]} 
				LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
		} 
		
	}else if(filter['select'] && filter['date']) {

		switch(filter['select']) {
			case "deactivated": 
				sql = `SELECT *, COUNT(*) OVER() AS total_count 
				FROM checks 
				WHERE public_domain_status = 'H' && date = '${filter['date']}'
				ORDER BY ${sort[0]} ${sort[1]} 
				LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
				break;

			case "deleted": 
				sql = `SELECT *, COUNT(*) OVER() AS total_count 
				FROM checks 
				WHERE status = 404 && date = '${filter['date']}'
				ORDER BY ${sort[0]} ${sort[1]} 
				LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
				break;

			default:
				sql = `SELECT *, COUNT(*) OVER() AS total_count 
				FROM checks 
				WHERE date = '${filter['date']}'
				ORDER BY ${sort[0]} ${sort[1]} 
				LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
		} 

	}else if(filter['q']) {
		sql = `SELECT *, COUNT(*) OVER() AS total_count 
		FROM checks 
		WHERE domain LIKE '%${filter['q']}%' 
		ORDER BY ${sort[0]} ${sort[1]} 
		LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`

	} else {
		sql = `SELECT *, COUNT(*) OVER() AS total_count 
		FROM checks 
		ORDER BY ${sort[0]} ${sort[1]} 
		LIMIT ${range[1] -range[0] + 1} OFFSET ${range[0]}`
	}

	connection.query(sql, (err, results, fields) => {
		res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
		if(results.length) {
			res.setHeader('Content-Range', `domain-details ${range[0]}-${range[1] + 1}/${results[0].total_count}`)
		}
		else {
			res.setHeader('Content-Range', 'domain-details 0-0/0')
		}
		res.send(results) 
	})
})


module.exports = router
