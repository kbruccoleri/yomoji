const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')

const app = express()

app.use(bodyParser.json())

app.post('/', (req, res) => {
    const { challenge, event } = req.body

    if (challenge) {
        return res.send({
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
        // if edit, previous message event.message
        const { user } = event


        if (!event.text.includes(':taco:')) return

        const results = parseBlocks(event.blocks)

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

const parseBlocks = ([ blocks ]) => {
    let nextblocks = blocks
    while (nextblocks.type !== 'rich_text_section') {
        nextblocks = nextblocks.elements[0]
    }

    const { elements } = nextblocks
    let recipient

    const blockObj = elements.reduce((memo, curr) => {
        const { type, user_id, name } = curr

        if (type === 'user') {
            memo.user = ++memo.user || 1
            recipient = user_id
        } else if (type === 'emoji' && name === 'taco') {
            memo.emoji = ++memo.emoji || 1
        }

        return memo
    }, {})

    if (blockObj.user !== 1) return null

    return {
        recipient,
        count: blockObj.emoji
    }
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
