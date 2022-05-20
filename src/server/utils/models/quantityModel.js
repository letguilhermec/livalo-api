const pool = require('../../app/pool')

class Model {
	constructor(table) {
		this.table = table
		this.pool = pool
		this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
	}

	async getStockQuantityById(id) {
		return this.pool.query(
			`SELECT available FROM ${this.table} WHERE prod_id = '${id}'`
		)
	}

	async addStockQuantity(id, quantity) {
		return this.pool.query(
			`UPDATE ${this.table} SET available = available + ${quantity} WHERE prod_id = '${id}' RETURNING available`
		)
	}

	async subStockQuantity(id, quantity) {
		return this.pool.query(
			`UPDATE ${this.table} SET available = available - ${quantity} WHERE prod_id = '${id}' RETURNING available`
		)
	}

	async getEveryQuantityTo100() {
		return this.pool.query(
			`UPDATE ${this.table} SET available = 100 WHERE prod_id IS NOT NULL`
		)
	}
}

module.exports = Model
