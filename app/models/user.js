const { getUsersInfo } = require('../slack')

const User = knex => ({
  async findOrCreate(username) {
    const userObject = { user_name: username }
    let [ user ] = await knex('user').where(userObject)

    if (!user) {
      const { user: { is_bot } } = await getUsersInfo(username)
      ;[ user ] = await knex('user').insert({...userObject, is_bot }, ['id'])
    }
    return user
  },
  async getSent(user) {
    const { id } = await this.findOrCreate(user)

    const [ val ] = await knex('user_event').count().where({ from_id: id })

    return val.count
  },
  async getReceived(user) {
    const { id } = await this.findOrCreate(user)

    const [ val ] = await knex('user_event').where({ to_id: id }).count()

    return val.count
  },
  async getLimit(user) {
    const { id } = await this.findOrCreate(user)

    const { limit } = await knex('user').select('limit').where({ id }).first()

    return limit
  },
  async decrement(user, amount = 1) {
    if (amount < 0 || amount > 5) return

    const { id } = await this.findOrCreate(user)

    await knex('user').where({ id }).decrement('limit', amount);
  }
})

module.exports = User
