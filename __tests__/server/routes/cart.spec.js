const { idleTimeoutMillis } = require('pg/lib/defaults')
const request = require('supertest')
const app = require('../../../src/server/app/server')

const permModel = require('../../../src/server/utils/models/PermanentCartModel')
const PermanentCart = new permModel('prods_cart')

describe('cart routes', () => {
	describe('for PERMANENT carts', () => {
		it('---', () => {})
	})
	describe('for TEMPORARY carts', () => {
		it('---', () => {})
	})
})
