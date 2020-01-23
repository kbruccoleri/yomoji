const UserEvent = require('../models')
const { User } = UserEvent

const giveTacos = async ({ count, recipient, user }) => {
    // TODO Wrap this in a transaction
    const limit = await User.getLimit(user)

    if (!limit) return {}

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

    const remaining = limit - allowedCount

    return {
        given: allowedCount,
        remaining,
    }
}

module.exports = giveTacos
