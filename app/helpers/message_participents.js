const { postMessage } = require('../slack')

const messageParticipents = (params) => {
    return Promise.all([
        messageRecipient(params),
        messageUser(params),
    ])
}

const messageRecipient = ({ user, recipient, given }) => {
    return postMessage({
        text: `<@${user}> gave you ${given}`,
        channel: recipient
    })
}

const messageUser = ({ user, recipient, given, remaining }) => {
    return postMessage({
        text: `You gave <@${recipient}> ${given}. You have ${remaining} left today`,
        channel: user
    })
}

module.exports = messageParticipents
