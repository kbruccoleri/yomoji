const express = require('express')
const bodyParser = require('body-parser')
const UserEvent = require('./models')
const { postMessage } = require('./slack')

const {
    giveTacos,
    createLeaderboard,
    parseBlocks,
} = require('./helpers')

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
    if (event.type === 'app_mention' && event.subtype !== 'bot_message') {
        let botMessage = 'I am a bot'

        if (event.text.includes('leaderboard')) {
            botMessage = await createLeaderboard()
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

        const { is_bot } = await User.findOrCreate(recipient)

        if (user === recipient || is_bot) return

        const given = await giveTacos({ recipient, count, user })

        if (!given) return

        return postMessage({
            text: `<@${user}> gave <@${recipient}> ${given}`,
            channel: event.channel
        })
    }
})

module.exports = app
