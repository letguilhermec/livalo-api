const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwtGenerator = require('../utils/middleware/jwtGenerator')
const validInfo = require('../utils/middleware/validInfo')
const Model = require('../utils/models/userModel')
const UserModel = new Model('users')

usersRouter.post('/register', validInfo, async (req, res) => {
	try {
		const { name, email, password, password2 } = req.body
		const tempCart = req.header('temp_cartNum') || null

		if (password !== password2) {
			return res.status(400).json('Passwords must match')
		}

		let checkUser = await UserModel.getUserByEmail(email)
		if (checkUser.rows.length !== 0) {
			return res.status(400).json('User already registered')
		}

		const hashedPassword = await bcrypt.hash(password, 8)

		let newUser

		if (tempCart) {
			newUser = await UserModel.createUserWithTempCart(
				name,
				email,
				hashedPassword,
				tempCart
			)
		} else {
			newUser = await UserModel.createUserNew(name, email, hashedPassword)
		}

		const token = jwtGenerator(newUser.rows[0].id)
		const cartNum = newUser.rows[0].cart
		return res.status(201).json({ token, cartNum })
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server error')
	}
})

usersRouter.post('/login', validInfo, async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await UserModel.getUserByEmail(email)

		if (user.rows.length === 0) {
			return res.status(400).json('Password or email is incorrect')
		}

		const validPassword = await bcrypt.compare(password, user.rows[0].password)

		if (!validPassword) {
			return res.status(400).json('Password or email is incorrect')
		}

		const token = jwtGenerator(user.rows[0].id)

		return res.status(200).json({ token })
	} catch (err) {
		console.error(err.message)
		return res.status(500).send('Server error')
	}
})

module.exports = usersRouter
