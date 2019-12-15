const config = require('./knexfile')
const User = require('./user')
const Event = require('./event')

const knex = require('knex')(config.development)

const UserEvent = knex => ({
  async create({ to, from, type }) {
    // transaction
  }
})

module.exports = UserEvent;
