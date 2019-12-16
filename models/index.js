const config = require('../knexfile')
const knex = require('knex')(config.development)

const User = require('./user')(knex)
const Event = require('./event')(knex)

const UserEvent = knex => ({
  async create({ to, from, type }) {
    // todo: transaction
    const { id: to_id } = await User.findOrCreate(to)
    const { id: from_id } = await User.findOrCreate(from)
    const { id: event_id } = await Event.findOrCreate(type)

    const UserEvent = await knex('event').insert({
      from_id,
      to_id,
      event_id,
    })
    return UserEvent
  }
})

module.exports = UserEvent;
