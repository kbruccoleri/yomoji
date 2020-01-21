const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const UserEvent = require('./models')
const { postMessage } = require('./slack')

const {
    giveTacos,
    createLeaderboard,
    parseBlocks,
    messageParticipents,
} = require('./helpers')

const { User } = UserEvent

const app = express()

const logger = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
app.use(morgan(logger))

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
            try {
                botMessage = 'TODO: PRs welcome - https://github.com/HeroProtagonist/yomoji' //await createLeaderboard()
            } catch (e) {
                console.log('Error creating leaderboard: ', e)
            }

        }

        const payloadType = Array.isArray(botMessage) ? 'blocks' : 'text'

        return postMessage({
            [payloadType]: botMessage,
            channel: event.channel,
            link_names: false,
        }).catch(console.log)
    }

    if (event.type === 'message' && event.subtype !== 'bot_message') {
        // if edit, previous message event.message
        const { user } = event

        if (!event.text.includes(':taco:')) return

        const results = parseBlocks(event.blocks)

        if (!results) return

        const { recipient, count } = results

        try {
            var { is_bot } = await User.findOrCreate(recipient)
        } catch (e) {
            console.log(`Error finding or creating user ${recipient}: `, e)
        }

        if (user === recipient || is_bot) return

        try {
            var { given, limit } = await giveTacos({ recipient, count, user })
        } catch (e) {
            console.log(`Error giving taco user ${{ recipient, count, user }}: `, e)
        }

        if (!given) {
            return postMessage({
                text: "You are out of tacos for today",
                channel: user
            }).catch(console.log)
        }

        return messageParticipents({
            recipient,
            limit,
            given,
            user,
        }).catch(console.log)
    }
})

module.exports = app
