require('dotenv').config()
const Pool = require('pg').Pool

const isProduction = process.env.NODE_ENV === 'production'

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.BD_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const pool = new Pool({
	connectionString: isProduction ? process.env.DATABASE_URL :	connectionString,
	ssl: {
        rejectUnauthorized: false,
    },
})

module.exports = pool
