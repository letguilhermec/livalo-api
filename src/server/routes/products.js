const productsRouter = require('express').Router()

const prodModel = require('../utils/models/productsModel')
const ProductsModel = new prodModel('prods')

productsRouter.get('/show/:offset', async (req, res) => {
	let offset = Number(req.params.offset)
	const products = await ProductsModel.getProducts(offset)
	return res.status(200).json(products.rows)
})

productsRouter.get('/pages', async (req, res) => {
	const NumOfPages = await ProductsModel.getPageTotal()
	return res.status(200).json(NumOfPages)
})

module.exports = productsRouter