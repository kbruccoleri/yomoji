const Event = knex => ({
  async findOrCreate(type) {
    const eventObject = { type }
    let [event] = await knex('event').where(eventObject)

    if (!event) {
      evwnt = await knex('event').insert(eventObject)
    }
    return event
  },
})

module.exports = Event;
