const User = knex => ({
  async findOrCreate(username) {
    const userObject = { user_name: username }
    let [user] = await knex('user').where(userObject)

    if (!user) {
      [user] = await knex('user').insert(userObject, ['id'])
    }
    return user
  },
})

module.exports = User
