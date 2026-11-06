# Sportz

Sportz is a backend service for managing sports matches and their live commentary. It provides a REST API for creating and listing matches and commentary, plus a WebSocket endpoint for real-time match and commentary events.

## Features

- Create matches with scheduled, live, or finished status calculated from their start and end times.
- List matches and retrieve a match's commentary with configurable result limits.
- Add structured commentary, including event details, tags, and optional metadata.
- Broadcast new matches and match-specific commentary to WebSocket clients.
- Store data in PostgreSQL using Drizzle ORM and database migrations.
- Protect WebSocket connections with Arcjet rules.

## Tech stack

- Node.js with Express
- PostgreSQL
- Drizzle ORM and Drizzle Kit
- WebSockets (`ws`)
- Zod request validation
- Arcjet

## Getting started

### Requirements

- Node.js and npm
- A PostgreSQL database
- An Arcjet API key

### Install

```bash
git clone https://github.com/mostafaesmail-tc/sportz.git
cd sportz
npm install
```

### Configure environment

Create a `.env` file in the project root:

```dotenv
DATABASE_URL=postgresql://localhost:5432/sportz
ARCJET_KEY=your_arcjet_key
```

The application requires both `DATABASE_URL` and `ARCJET_KEY`. Update the database URL with your PostgreSQL connection details if needed. Arcjet runs in live mode by default. To run its rules in dry-run mode, set:

```dotenv
ARCJECT_MODE=DRY_RUN
```

### Set up the database

Generate and apply the database migrations:

```bash
npm run db:generate
npm run db:migrate
```

### Run the server

Start the development server with automatic restarts:

```bash
npm run dev
```

Or run it without watch mode:

```bash
npm start
```

The server listens on `http://localhost:8000` by default. Set `PORT` or `HOST` in the environment to change the listening port or host.

## API

All request and response bodies use JSON. List endpoints return a `data` array; create endpoints return the created record under `data`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Returns a server greeting. |
| `GET` | `/matches?limit=50` | Lists matches, newest first. The default limit is 50; the maximum is 100. |
| `POST` | `/matches` | Creates a match. |
| `GET` | `/matches/:id/commentary?limit=10` | Lists commentary for a match, newest first. The default limit is 10; the maximum is 100. |
| `POST` | `/matches/:id/commentary` | Adds commentary to a match. |

Invalid IDs, query parameters, or request bodies return `400` with validation details. Server-side failures return `500`.

### Create a match

```bash
curl -X POST http://localhost:8000/matches \
  -H 'Content-Type: application/json' \
  -d '{
    "sport": "football",
    "homeTeam": "Lions",
    "awayTeam": "Tigers",
    "startTime": "2027-06-15T18:00:00.000Z",
    "endTime": "2027-06-15T20:00:00.000Z",
    "homeScore": 0,
    "awayScore": 0
  }'
```

`sport`, `homeTeam`, `awayTeam`, `startTime`, and `endTime` are required. Times must be ISO 8601 datetimes, and `endTime` must be later than `startTime`. Scores are optional non-negative integers and default to `0`. The match status is calculated as `scheduled`, `live`, or `finished` from the supplied times.

### Add commentary

Replace `1` with an existing match ID:

```bash
curl -X POST http://localhost:8000/matches/1/commentary \
  -H 'Content-Type: application/json' \
  -d '{
    "minute": 12,
    "sequence": 1,
    "period": "first half",
    "eventType": "goal",
    "actor": "Jordan Lee",
    "team": "Lions",
    "message": "The Lions take the lead!",
    "metadata": { "assist": "Alex Kim" },
    "tags": ["goal"]
  }'
```

`minute` and `message` are required. The other fields are optional; `metadata` is an object and `tags` is an array of strings.

## WebSocket events

Connect to `ws://localhost:8000/ws`. The server sends a welcome message when the connection is established. Subscribe to commentary for a match by sending:

```json
{ "type": "subscribe", "matchId": 1 }
```

To stop receiving commentary for that match, send:

```json
{ "type": "unsubscribe", "matchId": 1 }
```

The server confirms subscriptions with `subscribed` or `unsubscribed` messages. When a match is created, connected clients receive a `match_created` event. Subscribers receive new commentary as a `commentary` event:

```json
{ "type": "commentary", "data": { "id": 1, "matchId": 1, "minute": 12, "message": "The Lions take the lead!" } }
```

Use `npx wscat -c ws://localhost:8000/ws` to connect from a terminal.

## Project structure

```text
src/
  db/           Database connection and schema
  routes/       Match and commentary REST endpoints
  validation/   Request validation schemas
  utils/        Match status helpers
  ws/           WebSocket server and event broadcasting
  arcjet.js     Arcjet configuration and middleware
drizzle/        Database migrations
```

## npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the server in watch mode. |
| `npm start` | Start the server. |
| `npm run db:generate` | Generate migrations from the Drizzle schema. |
| `npm run db:migrate` | Apply pending migrations. |
