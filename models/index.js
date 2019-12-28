const { orderBy } = require('lodash')
const config = require('../knexfile')
const knex = require('knex')(config.development)

const User = require('./user')(knex)
const Event = require('./event')(knex)

const UserEvent = {
  async create({ to, from, type }) {
    // todo: transaction
    const { id: to_id } = await User.findOrCreate(to)
    const { id: from_id } = await User.findOrCreate(from)
    const { id: event_id } = await Event.findOrCreate(type)

    const userEvent = await knex('user_event').insert({
      from_id,
      to_id,
      event_id,
    })
    return userEvent
  },
  async getLeaders() {
    const users = await knex('user').select()

    // use promisify.all
    const userCounts = []
    for (const user of users) {
      const count  = await knex('user_event').where({ to_id: user.id }).count().first()
      userCounts.push({ ...user, ...count })
    }

    return orderBy(userCounts, 'count', 'desc')
  }

}

module.exports = UserEvent;
