const pool = require('../../app/pool')

class Model {
	constructor(table) {
		this.table = table
		this.pool = pool
		this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
	}

	async truncate() {
		return this.pool.query(`TRUNCATE ${this.table} CASCADE`)
	}

	async getUserById(id) {
		return this.pool.query(`SELECT * FROM ${this.table} WHERE id = '${id}'`)
	}

	async getUserByEmail(email) {
		return this.pool.query(
			`SELECT * FROM ${this.table} WHERE email = '${email}'`
		)
	}

	async createUserNew(name, email, password) {
		return this.pool.query(
			`INSERT INTO ${this.table} (name, email, password) VALUES ('${name}', '${email}', '${password}') RETURNING *`
		)
	}

	async createUserWithTempCart(name, email, password, temp_cartNum) {
		return this.pool.query(
			`INSERT INTO ${this.table} (name, email, password, cart) VALUES ('${name}', '${email}', '${password}', '${cart}') RETURNING *`
		)
	}
}

module.exports = Model
