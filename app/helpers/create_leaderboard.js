const UserEvent = require('../../models')

const createLeaderboard = async () => {
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

module.exports = createLeaderboard
