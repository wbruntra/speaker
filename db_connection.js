const Knex = require('knex')
const knexfile = require('./knexfile')
const NODE_ENV = process.env.NODE_ENV || 'development'
const config = knexfile[NODE_ENV]

const knex = Knex(config)

module.exports = knex