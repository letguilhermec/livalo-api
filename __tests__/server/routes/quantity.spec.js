const { idleTimeoutMillis } = require('pg/lib/defaults')
const request = require('supertest')
const app = require('../../../src/server/app/server')

const Model = require('../../../src/server/utils/models/quantityModel')
const QuantityModel = new Model('quantity')

const mockModel = 'CO515ACF40TTV'

describe('quantity model', () => {
	beforeEach(() => QuantityModel.getEveryQuantityTo100())
	afterAll(() => QuantityModel.getEveryQuantityTo100())

	it('should get the correct quantity w/ getStockQuantityById', async () => {
		const quantity = await QuantityModel.getStockQuantityById(mockModel)

		expect(quantity.rows[0].available).toBe(100)
	})
	it('should add the correct quantity to the prod_id row', async () => {
		const quantity = await QuantityModel.getStockQuantityById(mockModel)

		const addedQuantity = 10

		const newQuantity = await QuantityModel.addStockQuantity(
			mockModel,
			addedQuantity
		)

		expect(quantity.rows[0].available).toBe(100)
		expect(newQuantity.rows[0].available).toBe(
			quantity.rows[0].available + addedQuantity
		)
	})
	it('should subtract the correct quantity from the prod_id row', async () => {
		const quantity = await QuantityModel.getStockQuantityById(mockModel)

		const subQuantity = 10

		const newQuantity = await QuantityModel.subStockQuantity(
			mockModel,
			subQuantity
		)

		expect(quantity.rows[0].available).toBe(100)
		expect(newQuantity.rows[0].available).toBe(
			quantity.rows[0].available - subQuantity
		)
	})
})
