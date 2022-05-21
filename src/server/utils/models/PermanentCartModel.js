const pool = require('../../app/pool')

class Model {
	constructor(table) {
		this.table = table
		this.pool = pool
		this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
	}

	async getCartByNum(cartNum) {
		return this.pool.query(
			`SELECT * FROM ${this.table} WHERE user_cart = '${cartNum}'`
		)
	}

	async addToCart(cartNum, prodId) {
		return this.pool.query(
			`INSERT INTO ${this.table} (user_cart, prod_id) VALUES ('${cartNum}', '${prodId}') RETURNING *`
		)
	}

	async deleteFromCart(cartNum, prodId) {
		return this.pool.query(
			`DELETE FROM ${this.table} WHERE user_cart = '${cartNum}' AND prod_id = '${prodId}'`
		)
	}

	async addQuantity(cartNum, prodId) {
		return this.pool.query(
			`UPDATE ${this.table} SET quantity = quantity + 1 WHERE user_cart = '${cartNum}' AND prod_id = '${prodId}' RETURNING *`
		)
	}

	async subQuantity(cartNum, prodId) {
		return this.pool.query(
			`UPDATE ${this.table} SET quantity = quantity - 1 WHERE user_cart = '${cartNum}' AND prod_id = '${prodId}' RETURNING *`
		)
	}

	async insertFromTempCart(cartNum) {
		return this.pool.query(
			`INSERT INTO ${this.table} (user_cart, prod_id, quantity) SELECT * FROM temp_cart WHERE user_cart = '${cartNum}'`
		)
	}

	async truncate() {
		return this.pool.query(`TRUNCATE ${this.table} CASCADE`)
	}
}

module.exports = Model
