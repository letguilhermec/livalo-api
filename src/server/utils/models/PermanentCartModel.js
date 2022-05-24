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

	async checkProduct(cartNum, prodId) {
		return this.pool.query(
			`SELECT * FROM ${this.table} WHERE user_cart = '${cartNum}' AND prod_id = '${prodId}'`
		)
	}

	async getFromCart(cartNum) {
		return this.pool.query(
			`SELECT prods.id, prods.image, prods.name, prods.brand, prods.price, ${this.table}.quantity FROM prods JOIN ${this.table} ON prods.id = ${this.table}.prod_id JOIN users ON users.cart = ${this.table}.user_cart AND users.cart = '${cartNum}'`
		)
	}

	async addToCart(cartNum, prodId) {
		return this.pool.query(
			`INSERT INTO ${this.table} (user_cart, prod_id) VALUES ('${cartNum}', '${prodId}') RETURNING *`
		)
	}

	async addToCartQty(cartNum, prodId, quantity) {
		return this.pool.query(
			`INSERT INTO ${this.table} (user_cart, prod_id, quantity) VALUES ('${cartNum}', '${prodId}', '${quantity}') RETURNING *`
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

	async addQuantityQty(cartNum, prodId, quantity) {
		return this.pool.query(
			`UPDATE ${this.table} SET quantity = quantity + ${quantity} WHERE user_cart = '${cartNum}' AND prod_id = '${prodId}' RETURNING *`
		)
	}

	async subQuantity(cartNum, prodId) {
		return this.pool.query(
			`UPDATE ${this.table} SET quantity = quantity - 1 WHERE user_cart = '${cartNum}' AND prod_id = '${prodId}' RETURNING *`
		)
	}

	async insertFromTempCart(temp_cartNum, cartNum) {
		return this.pool.query(
			`INSERT INTO ${this.table} (user_cart, prod_id, quantity) SELECT COALESCE('${cartNum}', user_cart), prod_id, quantity FROM temp_cart WHERE user_cart = '${temp_cartNum}'`
		)
	}

	async truncate() {
		return this.pool.query(`TRUNCATE ${this.table} CASCADE`)
	}
}

module.exports = Model
