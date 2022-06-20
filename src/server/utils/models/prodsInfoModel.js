const pool = require('../../app/pool')

class Model {
  constructor(table) {
    this.table = table
    this.pool = pool
    this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
  }

  async getProduct(prodId) {
    return this.pool.query(`SELECT prods.brand, prods.name, prods.price, prods_info.* FROM prods JOIN ${this.table} ON prods.id = '${prodId}'`)
  }
}

module.exports = Model
