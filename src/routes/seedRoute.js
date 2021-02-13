const express = require('express')

const connection = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
	const sql = `SELECT * FROM domains`
	connection.query(sql, (err, results, fields) => {
		res.send(results) 
	})
})

router.post('/', (req, res) => {

	let { domainList } = req.body.data
	domainList = domainList.map(domain => [domain])

	connection.beginTransaction(function(err) {
	  if (err) { throw err; }
	  connection.query('DELETE FROM domains', function (error, results, fields) {
	    if (error) {
	      return connection.rollback(function() {
	        throw error;
	      });
	    }

	    connection.query(`INSERT INTO domains (domain_name) VALUES ?`, [domainList], function (error, results, fields) {
	      if (error) {
	        return connection.rollback(function() {
	          throw error;
	        });
	      }
	      connection.commit(function(err) {
	        if (err) {
	          return connection.rollback(function() {
	            throw err;
	          });
	        }
	        res.send({ status: 200 })
	      });
	    });
	  });
	});
})

module.exports = router
