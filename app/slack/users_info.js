const fetch = require('node-fetch')

const getUsersInfo = async user => {
    const res = await fetch(`https://slack.com/api/users.info?user=${user}`, {
        headers: {
            Authorization: `Bearer ${process.env.BOT_TOKEN}`
        },
    })

    const userInfo = await res.json()

    return userInfo
}

module.exports = getUsersInfo
