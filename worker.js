const { CronJob } = require('cron')
const config = require('./knexfile')

const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const worker = () => ({
    async refillUsers (limit = 5) {
        const knex = require('knex')(config[ENV])
        try {
            await knex('user').update({ limit }).where('limit', '<', limit)
        } catch (e) {
            console.log('Error refilling users limit: ', e)
        }
        knex.destroy()
    },
    midnightReset() {
        const job = new CronJob('00 00 00 * * *', async function() {
            console.log('Refill job started at: ', new Date())
            await this.refillUsers()
            console.log('Refill job finished at: ', new Date())
        })
        job.start()
    }
})

const w = worker()
w.midnightReset()
