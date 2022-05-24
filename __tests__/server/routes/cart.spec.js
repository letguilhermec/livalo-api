const { idleTimeoutMillis } = require('pg/lib/defaults')
const request = require('supertest')
const app = require('../../../src/server/app/server')

// import Models
const permModel = require('../../../src/server/utils/models/PermanentCartModel')
const PermanentCart = new permModel('prods_cart')

const tempModel = require('../../../src/server/utils/models/TemporaryCartModel')
const TemporaryCart = new tempModel('temp_cart')

const usrModel = require('../../../src/server/utils/models/userModel')
const UserModel = new usrModel('users')

const qtyModel = require('../../../src/server/utils/models/quantityModel')
const QuantityModel = new qtyModel('quantity')

//create consistent body data
const registerBody = {
	name: 'any_name',
	email: 'any_email@mail.com',
	password: 'any_password'
}
const temp_cartNum = 'a2e0b120-2a73-4beb-8689-654610215bb1'
const prodId1 = 'CO515ACF40TTV'
const prodId2 = 'CO515ACF37BAW'
const uuidRegEx =
	/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

describe('The permanent cart Model', () => {
	// cleanup
	beforeEach(() => UserModel.truncate())
	afterAll(() => UserModel.truncate())

	it('should get the cart by number with getCartByNum()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart = await PermanentCart.addToCart(cartNum, prodId1)

		const getCart = await PermanentCart.getCartByNum(cartNum)

		expect(getCart.rows.length).not.toBe(0)
	})

	it('should add a single item to cart with quantity = 1 with addToCart()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart = await PermanentCart.addToCart(cartNum, prodId1)

		const getCart = await PermanentCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].user_cart).toBe(cartNum)
		expect(getCart.rows[0].prod_id).toBe(prodId1)
		expect(getCart.rows[0].quantity).toBe(1)
	})

	it('should delete a single item from cart with deleteFromCart()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await PermanentCart.addToCart(cartNum, prodId1)

		const addProductToCart2 = await PermanentCart.addToCart(cartNum, prodId2)

		const deleteItem1 = await PermanentCart.deleteFromCart(cartNum, prodId1)

		const getCart = await PermanentCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].prod_id).toBe(prodId2)
	})

	it('should add 1 to existing quantity with addQuantity()', async () => {
		const user = await UserModel.createUserWithTempCart(
			registerBody.name,
			registerBody.email,
			registerBody.password,
			temp_cartNum
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await PermanentCart.addToCart(cartNum, prodId1)

		const addQuantity = await PermanentCart.addQuantity(cartNum, prodId1)

		const getCart = await PermanentCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].prod_id).toBe(prodId1)
		expect(getCart.rows[0].quantity).toBe(2)
	})

	it('should subtract 1 to existing quantity when quantity > 1 with subQuantity()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await PermanentCart.addToCart(cartNum, prodId1)

		const addQuantity = await PermanentCart.addQuantity(cartNum, prodId1)

		const subQuantity = await PermanentCart.subQuantity(cartNum, prodId1)

		const getCart = await PermanentCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].quantity).toBe(1)
	})
})

// --------------------------------!!!!!!!!--------------

describe('The temporary cart Model', () => {
	// cleanup
	beforeEach(() => UserModel.truncate())
	beforeEach(() => TemporaryCart.truncate())
	afterAll(() => UserModel.truncate())
	afterAll(() => TemporaryCart.truncate())

	it('should get the cart by number with getCartByNum()', async () => {
		const user = await UserModel.createUserWithTempCart(
			registerBody.name,
			registerBody.email,
			registerBody.password,
			temp_cartNum
		)

		const cartNum = user.rows[0].cart

		const addProductToCart = await TemporaryCart.addToCart(cartNum, prodId1)

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).not.toBe(0)
	})

	it('should add a single item to cart with quantity = 1 with addToCart()', async () => {
		const user = await UserModel.createUserWithTempCart(
			registerBody.name,
			registerBody.email,
			registerBody.password,
			temp_cartNum
		)

		const cartNum = user.rows[0].cart

		const addProductToCart = await TemporaryCart.addToCart(cartNum, prodId1)

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].user_cart).toBe(cartNum)
		expect(getCart.rows[0].prod_id).toBe(prodId1)
		expect(getCart.rows[0].quantity).toBe(1)
	})

	it('should delete a single item from cart with deleteFromCart()', async () => {
		const user = await UserModel.createUserWithTempCart(
			registerBody.name,
			registerBody.email,
			registerBody.password,
			temp_cartNum
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await TemporaryCart.addToCart(cartNum, prodId1)

		const addProductToCart2 = await TemporaryCart.addToCart(cartNum, prodId2)

		const deleteItem1 = await TemporaryCart.deleteFromCart(cartNum, prodId1)

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].prod_id).toBe(prodId2)
	})

	it('should add 1 to existing quantity with addQuantity()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await TemporaryCart.addToCart(cartNum, prodId1)

		const addQuantity = await TemporaryCart.addQuantity(cartNum, prodId1)

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].prod_id).toBe(prodId1)
		expect(getCart.rows[0].quantity).toBe(2)
	})

	it('should subtract 1 to existing quantity when quantity > 1 with subQuantity()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await TemporaryCart.addToCart(cartNum, prodId1)

		const addQuantity = await TemporaryCart.addQuantity(cartNum, prodId1)

		const subQuantity = await TemporaryCart.subQuantity(cartNum, prodId1)

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).toBe(1)
		expect(getCart.rows[0].quantity).toBe(1)
	})

	it('should delete the temporary cart and all items with deleteTempCart()', async () => {
		const user = await UserModel.createUserNew(
			registerBody.name,
			registerBody.email,
			registerBody.password
		)

		const cartNum = user.rows[0].cart

		const addProductToCart1 = await TemporaryCart.addToCart(cartNum, prodId1)

		const addProductToCart2 = await TemporaryCart.addToCart(cartNum, prodId2)

		const getCart1 = await TemporaryCart.getCartByNum(cartNum)

		const deleteCart = await TemporaryCart.deleteTempCart(cartNum)

		const getCart2 = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart1.rows.length).toBe(2)
		expect(getCart2.rows.length).toBe(0)
	})

	it('-----------------------------', () => {})

	it('should create a new temp_cart when a prodId is added to cart and the user has no assingned cartNum', async () => {
		const newCart = await TemporaryCart.createTempCart(prodId1)

		const cartNum = newCart.rows[0].user_cart

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).not.toBe(0)
	})

	it('should create a new temp_cart with a uuid() user_cart', async () => {
		const newCart = await TemporaryCart.createTempCart(prodId1)

		const cartNum = newCart.rows[0].user_cart

		expect(cartNum).toMatch(uuidRegEx)
	})

	it('should return the user_cart', async () => {
		const newCart = await TemporaryCart.createTempCart(prodId1)

		const cartNum = newCart.rows[0].user_cart

		expect(cartNum).not.toBeNull()
	})

	it('should add the correct prodId to cart when creating a new Cart', async () => {
		const newCart = await TemporaryCart.createTempCart(prodId1)

		const cartNum = newCart.rows[0].user_cart

		const getCart = await TemporaryCart.getCartByNum(cartNum)

		expect(getCart.rows.length).not.toBe(0)
	})
})

describe('Cart routes', () => {
	// cleanup
	beforeEach(() => UserModel.truncate())
	afterAll(() => UserModel.truncate())

	describe('when there is no cart number in the header', () => {
		it('should return a 400 statusCode', async () => {
			const res = await request(app).post('/cart/getcart')

			expect(res.statusCode).toBe(400)
		})
		it('should return a "No cart number informed" message in res.body', async () => {
			const res = await request(app).post('/cart/getcart')

			expect(res.body).toBe('No cart number informed')
		})
	})

	describe('for PERMANENT carts', () => {
		describe('POST /getcart', () => {
			it('should return a 200 statusCode when there is a cart number in the header', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app).post('/cart/getcart').set({ cartNum })

				expect(res.statusCode).toBe(200)
			})
			it('should return the cart contents when a valid cart number id is provided in the header', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const addProductToCart1 = await PermanentCart.addToCart(
					cartNum,
					prodId1
				)

				const res = await request(app).post('/cart/getcart').set({ cartNum })

				expect(res.body.length).not.toBe(0)
				expect(res.body[0].id).toBe(prodId1)
			})
		})
		describe('POST /add', () => {
			it('should return a 400 statusCode when prodId is not provided', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app).post('/cart/add').set({ cartNum })

				expect(res.statusCode).toBe(400)
			})
			it('should return a 200 statusCode when a prodId is provided', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app)
					.post('/cart/add')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(200)
			})
			it('should insert the product into cart if its not already there', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app)
					.post('/cart/add')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				const getCart = await PermanentCart.getCartByNum(cartNum)

				expect(getCart.rows[0].prod_id).toBe(prodId1)
				expect(getCart.rows[0].quantity).toBe(1)
			})
			it('should add 1 to the product quantity in cart if its already there', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const addedProduct = await PermanentCart.addToCart(cartNum, prodId1)

				const res = await request(app)
					.post('/cart/add')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				const getCart = await PermanentCart.getCartByNum(cartNum)

				expect(getCart.rows[0].prod_id).toBe(prodId1)
				expect(getCart.rows[0].quantity).toBe(2)
			})
		})
		describe('PUT /sub', () => {
			it('should return a 400 statusCode when prodId is not provided in req.body', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app).put('/cart/sub').set({ cartNum })

				expect(res.statusCode).toBe(400)
			})
			it('should return a "No selected product" message in res.body when prodId is not provided in req.body', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app).put('/cart/sub').set({ cartNum })

				expect(res.body).toBe('No selected product')
			})
			it('should return a 400 statusCode when cartNum is not provided in req.header', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app)
					.put('/cart/sub')
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(400)
			})
			it('should return a "No cart number informed" message in res.body when cartNum is not provided in req.header', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app)
					.put('/cart/sub')
					.send({ prodId: prodId1 })

				expect(res.body).toBe('No cart number informed')
			})
			it('should return a 400 statusCode when the prodId is not in cart', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app)
					.put('/cart/sub')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(400)
			})
			it('should return a "Action could not be performed" message in res.body when the prodId is not in cart', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const res = await request(app)
					.put('/cart/sub')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				expect(res.body).toBe('Action could not be performed')
			})
			it('should subtract 1 from quantity when quantity > 1', async () => {
				const user = await UserModel.createUserNew(
					registerBody.name,
					registerBody.email,
					registerBody.password
				)

				const cartNum = user.rows[0].cart

				const addedProduct = await PermanentCart.addToCart(cartNum, prodId1)
				const newAdd = await PermanentCart.addQuantity(cartNum, prodId1)
				const secondAdd = await PermanentCart.getCartByNum(cartNum)

				const res = await request(app)
					.put('/cart/sub')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(200)
				expect(secondAdd.rows[0].quantity).toBe(2)
				expect(res.body[0].quantity).toBe(1)
			})
		})
	})

	describe('for TEMPORARY carts', () => {
		// cleanup
		beforeEach(() => UserModel.truncate())
		beforeEach(() => TemporaryCart.truncate())
		afterAll(() => UserModel.truncate())
		afterAll(() => TemporaryCart.truncate())

		describe('POST /getcart', () => {
			it('should return a 200 statusCode when there is a cart number in the header', async () => {
				const newCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = newCart.rows[0].user_cart

				const res = await request(app)
					.post('/cart/getCart')
					.set({ temp_cartNum: cartNum })

				expect(res.statusCode).toBe(200)
			})
			it('should return the cart contents when a valid cartNumber id is provided in the header', async () => {
				const newCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = newCart.rows[0].user_cart

				const res = await request(app)
					.post('/cart/getCart')
					.set({ temp_cartNum: cartNum })

				expect(res.body.length).not.toBe(0)
				expect(res.body[0].id).toBe(prodId1)
			})
		})

		describe('POST /add', () => {
			it('should return a 400 statusCode when prodId is not provided', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.post('/cart/add')
					.set({ temp_cartNum: cartNum })

				expect(res.statusCode).toBe(400)
			})
			it('should return a 200 statusCode when a prodId is provided', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.post('/cart/add')
					.set({ temp_cartNum: cartNum })
					.send({ prodId: prodId2 })

				expect(res.statusCode).toBe(200)
			})
			it('should insert the product into cart if its not already there', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.post('/cart/add')
					.set({ temp_cartNum: cartNum })
					.send({ prodId: prodId2 })

				const getCart = await TemporaryCart.getCartByNum(cartNum)

				expect(getCart.rows[0].prod_id).toBe(prodId2 || prodId1)
				expect(getCart.rows[0].quantity).toBe(1)
			})
			it('should add 1 to the product quantity in cart if its already there', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.post('/cart/add')
					.set({ temp_cartNum: cartNum })
					.send({ prodId: prodId1 })

				const getCart = await TemporaryCart.getCartByNum(cartNum)

				expect(getCart.rows[0].prod_id).toBe(prodId1)
				expect(getCart.rows[0].quantity).toBe(2)
			})
		})
		describe('PUT /sub', () => {
			it('should return a 400 statusCode when prodId is not provided in req.body', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.put('/cart/sub')
					.set({ temp_cartNum: cartNum })

				expect(res.statusCode).toBe(400)
			})
			it('should return a "No selected product" message in res.body when prodId is not provided in req.body', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.put('/cart/sub')
					.set({ temp_cartNum: cartNum })

				expect(res.body).toBe('No selected product')
			})
			it('should return a 400 statusCode when cartNum is not provided in req.header', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.put('/cart/sub')
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(400)
			})
			it('should return a "No cart number informed" message in res.body when cartNum is not provided in req.header', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.put('/cart/sub')
					.send({ prodId: prodId1 })

				expect(res.body).toBe('No cart number informed')
			})
			it('should return a 400 statusCode when the prodId is not in cart', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.put('/cart/sub')
					.set({ temp_cartNum: cartNum })
					.send({ prodId: prodId2 })

				expect(res.statusCode).toBe(400)
			})
			it('should return a "Action could not be performed" message in res.body when the prodId is not in cart', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const res = await request(app)
					.put('/cart/sub')
					.set({ cartNum })
					.send({ prodId: prodId1 })

				expect(res.body).toBe('Action could not be performed')
			})
			it('should subtract 1 from quantity when quantity > 1', async () => {
				const tempCart = await TemporaryCart.createTempCart(prodId1)

				const cartNum = tempCart.rows[0].user_cart

				const newAdd = await TemporaryCart.addQuantity(cartNum, prodId1)

				const res = await request(app)
					.put('/cart/sub')
					.set({ temp_cartNum: cartNum })
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(200)
				expect(newAdd.rows[0].quantity).toBe(2)
				expect(res.body[0].quantity).toBe(1)
			})
		})
	})
	describe('for NO cart', () => {
		describe('POST /add', () => {
			it('should return a 200 statusCode when no cartNum is provided', async () => {
				const res = await request(app)
					.post('/cart/add')
					.send({ prodId: prodId1 })

				expect(res.statusCode).toBe(200)
			})
			it('should create a temporary cart and return a cartNum property in body.res when no cartNum is provided', async () => {
				const res = await request(app)
					.post('/cart/add')
					.send({ prodId: prodId1 })

				expect(res.body).toHaveProperty('cartNum')
			})
			it('should return a valid cart number in cartNum property in res.body', async () => {
				const res = await request(app)
					.post('/cart/add')
					.send({ prodId: prodId1 })

				expect(res.body.cartNum).toMatch(uuidRegEx)
			})
			it('should return the cart info in a cart property in res.body', async () => {
				const res = await request(app)
					.post('/cart/add')
					.send({ prodId: prodId1 })

				expect(res.body).toHaveProperty('cart')
			})
			it('should add the product to the newly created cart with quantity = 1', async () => {
				const res = await request(app)
					.post('/cart/add')
					.send({ prodId: prodId1 })

				expect(res.body.cart[0].prod_id).toBe(prodId1)
				expect(res.body.cart[0].quantity).toBe(1)
			})
		})
	})
})
