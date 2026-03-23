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

## Running the relay

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Redis

The relay requires a running Redis instance. If you don't have one, install and start it:

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# or run in the foreground
redis-server
```

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

To use a remote or non-default Redis instance, set `REDIS_URL`:

```bash
export REDIS_URL=redis://your-host:6379
```

### 3. Start the relay

```bash
# development
pnpm start

# production
pnpm build
node dist/index.js
```

You can verify events are flowing by subscribing to the channel in a separate terminal:

```bash
redis-cli SUBSCRIBE jetstream:posts
```

## Dependencies

- [`@vinerima/wah`](https://www.npmjs.com/package/@vinerima/wah) — WebSocket client with reconnection, failover, and schema-based message handling
- [`@vinerima/jetstream-types`](https://www.npmjs.com/package/@vinerima/jetstream-types) — Zod schemas for Jetstream event types
- [`ioredis`](https://github.com/redis/ioredis) — Redis client

## License

MIT
