module.exports = async (req, res, next) => {
	try {
		const cartNum = req.header('cartNum')
		const temp_cartNum = req.header('temp_cartNum')

		if (cartNum) {
			req.cartNum = cartNum
			req.cartStatus = 'Permanent'
		}

		if (temp_cartNum) {
			req.cartNum = temp_cartNum
			req.cartStatus = 'Temporary'
		}

		if (!cartNum && !temp_cartNum) {
			req.cartStatus = 'None'
		}

		next()
	} catch (err) {
		console.error(err.message)
		res.status(400).json('Valid cart not found')
	}
}
