## Getting started

Install dependencies
```
npm install
```

Run migrations
```
npx knex migrate:latest
```

Copy and fill out `.env` file
```
cp .env.sample .env
```

Run development server
```
npm run dev
```

## Tunnel to localhost

```
npx ngrok http 8080
```
