require('dotenv').config()
const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../../../src/server/app/server')
const Model = require('../../../src/server/utils/models/userModel')
const { compare } = require('bcrypt')
const jwtGenerator = require('../../../src/server/utils/middleware/jwtGenerator')

const body = {
	name: 'any_name',
	email: 'any_email@mail.com',
	password: 'any_password',
	password2: 'any_password'
}

const loginBody = {
	email: 'any_email@mail.com',
	password: 'any_password'
}

const UserModel = new Model('users')

describe('user route', () => {
	beforeEach(() => UserModel.truncate())
	afterEach(() => UserModel.truncate())

	describe('POST /register', () => {
		it('should return a 400 statusCode when name || email || password || password2 are not provided', async () => {
			const res = await request(app).post('/users/register')

			expect(res.statusCode).toBe(400)
		})
		it('should return a "Missing credentials" in res.body when name || email || password || password2 are not provided', async () => {
			const res = await request(app).post('/users/register')

			expect(res.body).toBe('Missing credentials')
		})
		it('-----------------------------', () => {})

		it('should return a 400 statusCode when an invalid email is provided', async () => {
			const res = await request(app)
				.post('/users/register')
				.send({ ...body, email: 'invalid_email' })

			expect(res.statusCode).toBe(400)
		})
		it('should return a "Invalid Email" message in res.body when name || email || password || password2 are not provided', async () => {
			const res = await request(app)
				.post('/users/register')
				.send({ ...body, email: 'invalid_email' })

			expect(res.body).toBe('Invalid Email')
		})
		it('-----------------------------', () => {})

		it('should return a 400 statusCode when password !== password2', async () => {
			const res = await request(app)
				.post('/users/register')
				.send({ ...body, password2: 'another_password' })

			expect(res.statusCode).toBe(400)
		})
		it('should return a "Passwords must match" when password !== password2', async () => {
			const res = await request(app)
				.post('/users/register')
				.send({ ...body, password2: 'another_password' })

			expect(res.body).toBe('Passwords must match')
		})
		it('-----------------------------', () => {})
		it('should return a 400 statusCode if user is already registered', async () => {
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				body.password
			)

			const res = await request(app).post('/users/register').send(body)

			expect(res.statusCode).toBe(400)
		})
		it('should return a "User already registered" if user is already registered', async () => {
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				body.password
			)

			const res = await request(app).post('/users/register').send(body)

			expect(res.body).toBe('User already registered')
		})
		it('-----------------------------', () => {})
		it('should insert the new user in DB with a different password (hashed)', async () => {
			const res = await request(app).post('/users/register').send(body)

			const insertedUser = await UserModel.getUserByEmail(body.email)

			expect(insertedUser.rows[0].password).not.toBe(body.password)
		})
		it('should insert the new user in DB with a different password (hashed)', async () => {
			const res = await request(app).post('/users/register').send(body)

			const insertedUser = await UserModel.getUserByEmail(body.email)

			const comparedPasswords = await bcrypt.compare(
				body.password,
				insertedUser.rows[0].password
			)

			expect(comparedPasswords).toBe(true)
		})
		it('-----------------------------', () => {})
		it('should return a cartNum property in res.body containing the cart number assingned to the inserted user', async () => {
			const res = await request(app).post('/users/register').send(body)

			expect(res.body).toHaveProperty('cartNum')
		})
		it('should return a valid cart number inside cartNum property in res.body ', async () => {
			const res = await request(app).post('/users/register').send(body)

			const uuidRegEx =
				/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

			expect(res.body.cartNum).toMatch(uuidRegEx)
		})
		it('-----------------------------', () => {})
		it('should return a token property in res.body containing a JWT token', async () => {
			const res = await request(app).post('/users/register').send(body)

			expect(res.body).toHaveProperty('token')
		})
		it('should return a valid JWT token inside token property in res.body', async () => {
			const res = await request(app).post('/users/register').send(body)

			const payload = jwt.verify(res.body.token, process.env.JWT_SECRET)

			expect(payload).toHaveProperty('user')
		})
		it('should return a JWT token with the user id inside payload', async () => {
			const res = await request(app).post('/users/register').send(body)

			const user = await UserModel.getUserByEmail(body.email)
			const userId = user.rows[0].id

			const payload = jwt.verify(res.body.token, process.env.JWT_SECRET)

			expect(payload.user).toBe(userId)
		})
	})
	describe('POST /login', () => {
		beforeEach(() => UserModel.truncate())
		afterEach(() => UserModel.truncate())

		it('should return a 400 statusCode when email || password are not provided', async () => {
			const bodyData = [{ email: body.email }, { password: body.password }, {}]

			for (const body of bodyData) {
				const res = await request(app).post('/users/login').send(body)

				expect(res.statusCode).toBe(400)
			}
		})
		it('should return a "Missing credentials" message in res.body', async () => {
			const bodyData = [{ email: body.email }, { password: body.password }, {}]

			for (const body of bodyData) {
				const res = await request(app).post('/users/login').send(body)

				expect(res.body).toBe('Missing credentials')
			}
		})
		it('-----------------------------', () => {})
		it('should returen a 400 statusCode if an incorrect email is provided', async () => {
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				body.password
			)
			const res = await request(app)
				.post('/users/login')
				.send({ ...loginBody, email: 'invalid_email' })

			expect(res.statusCode).toBe(400)
		})
		it('should return a "Password or email is incorrect" message if an incorrect email is provided', async () => {
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				body.password
			)
			const res = await request(app)
				.post('/users/login')
				.send({ ...loginBody, email: 'invalid_email@mail.com' })

			expect(res.body).toBe('Password or email is incorrect')
		})
		it('-----------------------------', () => {})
		it('should return a 400 statusCode if the incorrect password is provided', async () => {
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				body.password
			)

			const res = await request(app)
				.post('/users/login')
				.send({ ...loginBody, password: 'invalid_password' })

			expect(res.statusCode).toBe(400)
		})
		it('should return a "Password or email is incorrect" if the incorrect password is provided', async () => {
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				body.password
			)

			const res = await request(app)
				.post('/users/login')
				.send({ ...loginBody, password: 'invalid_password' })

			expect(res.body).toBe('Password or email is incorrect')
		})
		it('-----------------------------', () => {})
		it('should return a 200 message if the correct credentials are provided', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const res = await request(app).post('/users/login').send(loginBody)

			expect(res.statusCode).toBe(200)
		})
		it('should return a token property in res.body', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const res = await request(app).post('/users/login').send(loginBody)

			expect(res.body).toHaveProperty('token')
		})
		it('should return a valid JWT token inside the token property in res.body', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const res = await request(app).post('/users/login').send(loginBody)

			const payload = jwt.verify(res.body.token, process.env.JWT_SECRET)

			expect(payload).toHaveProperty('user')
		})
		it('should return a JWT token with the user id inside payload', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const res = await request(app).post('/users/login').send(loginBody)

			const user = await UserModel.getUserByEmail(body.email)
			const userId = user.rows[0].id

			const payload = jwt.verify(res.body.token, process.env.JWT_SECRET)

			expect(payload.user).toBe(userId)
		})
	})
	describe('GET /is-verify', () => {
		it('should return a 400 statusCode if no valid JWT Token is provided', async () => {
			const res = await request(app).get('/users/is-verify')

			expect(res.statusCode).toBe(403)
		})
		it('should return a "Not authorized" message in res.body if no valid JWT Token is provided', async () => {
			const res = await request(app).get('/users/is-verify')

			expect(res.body).toBe('Not authorized')
		})
		it('should return a 200 statusCode if a valid JWT Token is provided', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const login = await request(app).post('/users/login').send(loginBody)

			const token = login.body.token

			const res = await request(app).get('/users/is-verify').set({ token })

			expect(res.statusCode).toBe(200)
		})
		it('should return a "true" boolean in res.body if a valid JWT Token is provided', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const login = await request(app).post('/users/login').send(loginBody)

			const token = login.body.token

			const res = await request(app).get('/users/is-verify').set({ token })

			expect(res.body).toBe(true)
		})
	})
	describe('GET /dashboard', () => {
		it('should return a 400 statusCode if no valid JWT Token is provided', async () => {
			const res = await request(app).get('/users/dashboard')

			expect(res.statusCode).toBe(403)
		})
		it('should return a "Not authorized" message in res.body if no valid JWT Token is provided', async () => {
			const res = await request(app).get('/users/dashboard')

			expect(res.body).toBe('Not authorized')
		})
		it('should return a 200 statusCode if a valid JWT Token is provided', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const login = await request(app).post('/users/login').send(loginBody)

			const token = login.body.token

			const res = await request(app).get('/users/dashboard').set({ token })

			expect(res.statusCode).toBe(200)
		})
		it('should return a the user name if a valid JWT Token is provided', async () => {
			const hashedPassword = await bcrypt.hash(body.password, 8)
			const newUser = await UserModel.createUserNew(
				body.name,
				body.email,
				hashedPassword
			)

			const login = await request(app).post('/users/login').send(loginBody)

			const token = login.body.token

			const res = await request(app).get('/users/dashboard').set({ token })

			expect(res.body.name).toBe(body.name)
		})
	})
})
