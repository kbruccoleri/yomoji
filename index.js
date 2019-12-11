const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')

const app = express()

app.use(bodyParser.json())

app.post('/', (req, res) => {
    const { challenge, event } = req.body

    if (challenge) {
        res.send({
            challenge
        })
    } else {
        res.sendStatus(200)
    }

    if (event.type === 'app_mention') {
        postToSlack({
            text: 'I am a bot',
            channel: event.channel
        })
    }

    if (event.type === 'message' && event.subtype !== 'bot_message') {
        if (!event.text.includes(':taco:')) return

        postToSlack({
            text: event.text,
            channel: event.channel
        })
    }
})

app.listen(8080, () => {
    console.log('Listening on 8080..')
})

const postToSlack = async ({
    text,
    channel,
}) => {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'post',
        body: JSON.stringify({ channel, text }),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${process.env.OAUTH_TOKEN}`
        },
    })

    const json = await res.json()

    console.log('SLACK RESPONSE:', json)
}

const checkUser = async user => {
    const res = await fetch(`https://slack.com/api/users.info?user=${user}`, {
        headers: {
            Authorization: `Bearer ${process.env.BOT_TOKEN}`
        },
    })

    const json = await res.json()

    console.log('SLACK RESPONSE:', json)
}
