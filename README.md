# jetstream-relay

Connects to the [Bluesky Jetstream](https://docs.bsky.app/docs/advanced-guides/firehose#jetstream) WebSocket firehose and republishes post-create events to a Redis Pub/Sub channel. This allows multiple downstream consumers to subscribe to the Redis channel independently, without each needing its own Jetstream connection.

## How it works

1. Opens a WebSocket connection to one of the Jetstream endpoints (US-East / US-West, with automatic failover across four servers).
2. Filters for `app.bsky.feed.post` events and validates them with Zod via `@vinerima/jetstream-types`.
3. Publishes each validated post-create event as JSON to a configurable Redis Pub/Sub channel.

## Prerequisites

- Node.js (v18+)
- A running Redis instance

## Configuration

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `REDIS_CHANNEL` | `jetstream:posts` | Pub/Sub channel name |

## Usage

```bash
pnpm install

# development
pnpm start

# build and run compiled output
pnpm build
node dist/index.js
```

## Dependencies

- [`@vinerima/wah`](https://www.npmjs.com/package/@vinerima/wah) — WebSocket client with reconnection, failover, and schema-based message handling
- [`@vinerima/jetstream-types`](https://www.npmjs.com/package/@vinerima/jetstream-types) — Zod schemas for Jetstream event types
- [`ioredis`](https://github.com/redis/ioredis) — Redis client

## License

MIT
