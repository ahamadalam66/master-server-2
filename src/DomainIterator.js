const axios = require('axios')
const connection = require('./db')

const saveDomainDetails = ({ public_domain_status, domain, createddate, domain_type, paiduntildate, periodqty, public_deletedate, status }) => {

	const sql = `INSERT INTO checks (public_domain_status, domain, createddate, domain_type, paiduntildate, periodqty, public_deletedate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	connection.query(sql, [public_domain_status, domain, createddate, domain_type, paiduntildate, periodqty, public_deletedate, status], (err, results, fields) => {
		
	})
}

const DomainIterator =  (domainList = [], serverList = []) => {

	let currentDomainIndex = 0
	let currentServerIndex = 0

	const totalDomainCount = domainList.length
	const totalServerCount = serverList.length

	const startTime = new Date()

	const progressResult = {
		successCount: 0,
		badDomainCount: 0,
		notFoundCount: 0,
		errorCount: 0,
		elapsedTime: 0,
		completed: false,
		totalDomainCount
	}

	return {
		hasNext: () => {
			return currentDomainIndex < totalDomainCount
		},
		saveToDatabase: async (callback) => {
			const domain = domainList[currentDomainIndex++]
			const serverUrl = serverList[currentServerIndex++]
			if(currentServerIndex % serverList.length === 0) currentServerIndex = 0

			try {
				const url = `${serverUrl}/api/domain/${domain}`
				
				const res = await axios.get(url, {
					headers: {
						'Accept': 'application/json'
					}
				})

				const data = await res.data

				await saveDomainDetails(data)
				progressResult.successCount++
			}catch(err) {
				if(err.response && err.response.status === 400) {
					let data = { domain, status: 400 }
					await saveDomainDetails(data)
					progressResult.badDomainCount++
				}else if(err.response && err.response.status === 404) {
					let data = { domain, status: 404 }
					await saveDomainDetails(data)
					progressResult.notFoundCount++
				}else{
					progressResult.errorCount++
				}
			} finally {
				callback()
			}

			progressResult.elapsedTime = (new Date() - startTime)/1000
			
			if(currentDomainIndex === totalDomainCount) progressResult.completed = true

		},
		getProgressResult: () => progressResult
	}
}

module.exports = DomainIterator
