const pool = require('../../app/pool')

class Model {
  constructor(table) {
    this.table = table
    this.pool = pool
    this.pool.on('error', (err, client) => `Error ${err} on client ${client}`)
  }

  async getProduct(prodId) {
    return this.pool.query(`SELECT prods.brand, prods.name, prods.price, prods_info.prod_id, prods_info.description, prods_info.rating, prods_info.information, prods_info.keywords, prods_info.payment, prods_info.more_imgs FROM prods JOIN ${this.table} ON prods.id = prods_info.prod_id AND prods.id = '${prodId}'`)
  }
}

module.exports = Model
