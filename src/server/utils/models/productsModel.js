const pool = require('../../app/pool')

class Model {
	constructor(table) {
		this.table = table
		this.pool = pool
		this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
	}

	async getTotalProducts() {
		return this.pool.query(`SElECT COUNT(*) FROM ${this.table}`)
	}

	async getProducts(offset) {
		if (parseInt(offset) === 1) {
			offset = 0
		} else {
			offset = parseInt(offset - 1) * 12
		}
		return this.pool.query(
			`SELECT * FROM ${this.table} LIMIT 12 OFFSET ${offset}`
		)
	}

	async getPageTotal() {
		const totalProds = await this.getTotalProducts()
		const totalPagesNum = Math.ceil(Number(totalProds.rows[0].count) / 12)
		return totalPagesNum
	}
}

module.exports = Model
