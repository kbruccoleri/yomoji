const UserEvent = require('../../models')
const { User } = UserEvent

const giveTacos = async ({ count, recipient, user }) => {
    const limit = await User.getLimit(user)

    if (!limit) return

    const allowedCount = Math.min(limit, count)
    const allowedArray = [...Array(allowedCount).keys()]

    const userEventPromises = allowedArray.map(_ => (
        UserEvent.create({
            to: recipient,
            from: user,
            type: 'taco'
        })
    ))

    await Promise.all(userEventPromises)
    await User.decrement(user, allowedCount)

    return allowedCount
}

module.exports = giveTacos
