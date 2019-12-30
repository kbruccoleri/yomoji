const express = require('express')
const bodyParser = require('body-parser')
const UserEvent = require('../models')
const { postMessage } = require('./slack')

const { User } = UserEvent

const app = express()

app.use(bodyParser.json())

app.post('/', async (req, res) => {
    const { challenge, event } = req.body

    if (challenge) {
        return res.send({
            challenge
        })
    } else {
        res.sendStatus(200)
    }

    // user mentions bot handle this
    if (event.type === 'app_mention') {
        let botMessage = 'I am a bot'

        if (event.text.includes('leaderboard')) {
            botMessage = await createLeaderBoard()
        }

        const payloadType = Array.isArray(botMessage) ? 'blocks' : 'text'

        return postMessage({
            [payloadType]: botMessage,
            channel: event.channel
        })
    }

    if (event.type === 'message' && event.subtype !== 'bot_message') {
        // if edit, previous message event.message
        const { user } = event

        if (!event.text.includes(':taco:')) return

        const results = parseBlocks(event.blocks)

        if (!results) return

        const { recipient, count } = results

        if (user === recipient) return

        const given = await giveTacos({ recipient, count, user })

        if (!given) return

        return postMessage({
            text: `<@${user}> gave <@${recipient}> ${given}`,
            channel: event.channel
        })
    }
})

app.listen(8080, () => {
    console.log('Listening on 8080..')
})

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

    // Can only give tacos to one user in a message
    if (blockObj.user !== 1) return null

    return {
        recipient,
        count: blockObj.emoji
    }
}

const createLeaderBoard = async () => {
    const leaders = await UserEvent.getLeaders()

    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "Top 5"
            }
        },
        {
            type: "divider"
        },
        ...leaders.map(userText)
    ]
}

const userText = ({ user_name, count }) => ({
    type: "section",
    text: {
        type: "mrkdwn",
        text: `<@${user_name}> ${count} :taco:`
    }
})

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
