const pool = require('../../app/pool')

class Model {
  constructor(table) {
    this.table = table
    this.pool = pool
    this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
  }

  async getProduct(prodId) {
    return this.pool.query(`SElECT * FROM ${this.table} WHERE prod_id = '${prodId}'`)
  }
}

module.exports = Model
