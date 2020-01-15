const config = require('./knexfile')

const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const knex = require('knex')(config[ENV])

const worker = () => ({
    async refillUsers (limit = 5) {
        try {
            await knex('user').update({ limit }).where('limit', '<', limit)
        } catch (e) {
            console.log('Error refilling users limit: ', e)
        }
    }
})

module.exports = worker()
