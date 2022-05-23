const request = require('supertest')
const app = require('../../../src/server/app/server')

const prodModel = require('../../../src/server/utils/models/productsModel')
const ProductsModel = new prodModel('prods')

describe('Products routes', () => {
	describe('GET /pages', () => {
		it('should return a 200 statusCode', async () => {
			const res = await request(app).get('/products/pages')

			expect(res.statusCode).toBe(200)
		})
		it('should return the correct number of pages depending on the total number of products', async () => {
			const getTotalProds = await ProductsModel.getTotalProducts()
			const totalProdsNum = getTotalProds.rows[0].count

			const res = await request(app).get('/products/pages')

			const expectedValue = Math.ceil(totalProdsNum / 12)

			expect(res.body).toBe(expectedValue)
		})
	})
	describe('GET /:offset', () => {
		it('should return a 200 statusCode', async () => {
			const res = await request(app).get('/products/show/1')

			expect(res.statusCode).toBe(200)
		})
		it('should return an array containing 12 products', async () => {
			const res = await request(app).get('/products/show/1')

			expect(res.body.length).toBe(12)
		})
		it('should return an array containing 12 products', async () => {
			const firstProdNoOffset = 'CO515ACF40TTV'
			const secondProdOffset2 = 'IA057ACF40QEH'

			const res1 = await request(app).get('/products/show/1')

			const res2 = await request(app).get('/products/show/2')

			expect(res1.body[0].id).toBe(firstProdNoOffset)
			expect(res2.body[0].id).toBe(secondProdOffset2)
		})
	})
})
