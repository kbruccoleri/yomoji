const fetch = require('node-fetch')

const getUsersInfo = async user => {
    const res = await fetch(`https://slack.com/api/users.info?user=${user}`, {
        headers: {
            Authorization: `Bearer ${process.env.BOT_TOKEN}`
        },
    })
    return await res.json()
}

module.exports = getUsersInfo
