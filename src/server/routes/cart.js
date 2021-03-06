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
    // cart = await PermanentCart.getCartByNum(req.cartNum)
    cart = await PermanentCart.getFromCart(req.cartNum)
    return res.status(200).json(cart.rows)
  }

  if (status === 'Temporary') {
    // cart = await TemporaryCart.getCartByNum(req.cartNum)
    cart = await TemporaryCart.getFromCart(req.cartNum)
    return res.status(200).json(cart.rows)
  }

  return res.status(400).json('Nenhum número de carrinho informado')
})

cartRouter.post('/add', checkCart, async (req, res) => {
  const status = req.cartStatus
  const cartNum = req.cartNum
  const { prodId } = req.body

  if (!prodId) {
    return res.status(400).json('Nenhum produto selecionado')
  }

  if (status === 'Permanent') {
    const checkExists = await PermanentCart.checkProduct(cartNum, prodId)
    if (checkExists.rows.length === 0) {
      const inserted = await PermanentCart.addToCart(cartNum, prodId)
      return res.status(200).json(inserted.rows)
    } else {
      const added = await PermanentCart.addQuantity(cartNum, prodId)
      return res.status(200).json(added.rows)
    }
  }

  if (status === 'Temporary') {
    const checkExists = await TemporaryCart.checkProduct(cartNum, prodId)
    if (checkExists.rows.length === 0) {
      const inserted = await TemporaryCart.addToCart(cartNum, prodId)
      return res.status(200).json(inserted.rows)
    } else {
      const added = await TemporaryCart.addQuantity(cartNum, prodId)
      return res.status(200).json(added.rows)
    }
  }

  if (status === 'None') {
    const createdCart = await TemporaryCart.createTempCart(prodId)
    const cart = await TemporaryCart.getCartByNum(createdCart.rows[0].user_cart)
    return res
      .status(200)
      .json({ cartNum: cart.rows[0].user_cart, cart: cart.rows })
  }
})

cartRouter.put('/sub', checkCart, async (req, res) => {
  const { prodId } = req.body
  const status = req.cartStatus
  const cartNum = req.cartNum

  if (!prodId) {
    return res.status(400).json('Nenhum produto selecionado')
  }

  if (status === 'None') {
    return res.status(400).json('Nenhum número de carrinho informado')
  }

  if (status === 'Permanent') {
    const subItem = await PermanentCart.subQuantity(cartNum, prodId)
    if (subItem.rows.length === 0) {
      return res.status(400).json('Ação não pôde ser concluída')
    }
    return res.status(200).json(subItem.rows)
  }

  if (status === 'Temporary') {
    const subItem = await TemporaryCart.subQuantity(cartNum, prodId)
    if (subItem.rows.length === 0) {
      return res.status(400).json('Ação não pôde ser concluída')
    }
    return res.status(200).json(subItem.rows)
  }
})

cartRouter.delete('/del', checkCart, async (req, res) => {
  const { prodId } = req.body
  const status = req.cartStatus
  const cartNum = req.cartNum

  if (!prodId) {
    return res.status(400).json('Nenhum produto selecionado')
  }

  if (status === 'None') {
    return res.status(400).json('Nenhum número de carrinho informado')
  }

  if (status === 'Permanent') {
    const delItem = await PermanentCart.deleteFromCart(cartNum, prodId)
    if (delItem.rows.length === 0) {
      return res.status(400).json('Produto não encontrado no carrinho')
    }
    return res.status(200).json(delItem.rows)
  }

  if (status === "Temporary") {
    const delItem = await TemporaryCart.deleteFromCart(cartNum, prodId)
    if (delItem.rows.length === 0) {
      return res.status(400).json('Produto não encontrado no carrinho')
    }
    return res.status(200).json(delItem.rows)
  }
})

module.exports = cartRouter
