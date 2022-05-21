const cartRouter = require('express').Router()
const checkCart = require('../utils/middleware/checkCart')

const permModel = require('../utils/models/PermanentCartModel')
const PermanentCart = new permModel('prods_cart')

const tempModel = require('../utils/models/TemporaryCartModel')
const TemporaryCart = new tempModel('temp_cart')

cartRouter.post('/getcart', checkCart, async (req, res) => {
	let cart
	const status = req.cartStatus

	if (status === 'Permanent') {
		cart = await PermanentCart.getCartByNum(req.cartNum)
		return res.status(200).json(cart.rows)
	}

	if (status === 'Temporary') {
		cart = await TemporaryCart.getCartByNum(req.cartNum)
		return res.status(200).json(cart.rows)
	}

	return res.status(400).json('No cart number informed')
})

cartRouter.post('/add', checkCart, async (req, res) => {
	const status = req.cartStatus
	const cartNum = req.cartNum
	const { prodId } = req.body

	if (!prodId) {
		return res.status(400).json('No selected product')
	}

	if (status === 'Permanent') {
		const checkExists = await PermanentCart.getCartByNum(cartNum)
		if (checkExists.rows.length === 0) {
			const inserted = PermanentCart.addToCart(cartNum, prodId)
			return res.status(200).json(inserted.rows)
		} else {
			const added = PermanentCart.addQuantity(cartNum, prodId)
			return res.status(200).json(added.rows)
		}
	}

	if (status === 'Temporary') {
		const checkExists = await TemporaryCart.getCartByNum(cartNum)
		if (checkExists.rows.length === 0) {
			const inserted = TemporaryCart.addToCart(cartNum, prodId)
			return res.status(200).json(inserted.rows)
		} else {
			const added = TemporaryCart.addQuantity(cartNum, prodId)
			return res.status(200).json(added.rows)
		}
	}

	if (status === 'None') {
		const createdCart = await TemporaryCart.createTempCart(prodId)
		const cart = await TemporaryCart.getCartByNum(createdCart.rows[0].user_cart)
		return res
			.status(200)
			.json({ cartNum: createdCart.rows[0].user_cart, cart: cart.rows })
	}
})

cartRouter.get('/test', (req, res) => {
	res.json('Teste')
})

module.exports = cartRouter
