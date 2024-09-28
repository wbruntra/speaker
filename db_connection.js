const Knex = require('knex')
const config = require('./knexfile.js').development

const knex = Knex(config)

module.exports = knex