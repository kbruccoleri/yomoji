const fetch = require('node-fetch')

const postMessage = async message => {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'post',
        body: JSON.stringify(message),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${process.env.BOT_TOKEN}`
        },
    })

    const json = await res.json()

    return json
}

module.exports = postMessage
