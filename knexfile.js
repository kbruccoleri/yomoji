require('dotenv').config()

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'yomoji_dev',
      user:     '',
      password: ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.RDS_HOST,
      database: process.env.RDS_DATABASE,
      user:     process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
