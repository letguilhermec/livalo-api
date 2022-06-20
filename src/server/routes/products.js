const productsRouter = require('express').Router()

const prodModel = require('../utils/models/productsModel')
const ProductsModel = new prodModel('prods')
const prodsInfoModel = require('../utils/models/prodsInfoModel')
const ProdsInfoModel = new prodsInfoModel('prods_info')

productsRouter.get('/show/:offset', async (req, res) => {
  let offset = Number(req.params.offset)
  const products = await ProductsModel.getProducts(offset)
  return res.status(200).json(products.rows)
})

productsRouter.get('/pages', async (req, res) => {
  const NumOfPages = await ProductsModel.getPageTotal()
  return res.status(200).json(NumOfPages)
})

productsRouter.get('/all', async (req, res) => {
  const products = await ProductsModel.getTotalProds()
  return res.status(200).json(products.rows)
})

productsRouter.get('/product/:id', async (req, res) => {
  return res.status(200).json(req.params.id)
})

module.exports = productsRouter
