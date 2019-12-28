const User = knex => ({
  async findOrCreate(username) {
    const userObject = { user_name: username }
    let [ user ] = await knex('user').where(userObject)

    if (!user) {
      [ user ] = await knex('user').insert(userObject, ['id'])
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
  async decrement(user, amount = 1) {
    const { id } = await this.findOrCreate(user)

    await knex('user').where({ id }).decrement('limit', amount);
  }
})

module.exports = User

