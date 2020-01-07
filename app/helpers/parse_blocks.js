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

module.exports = parseBlocks
