import { WebSocketClient } from "@vinerima/wah";
import Redis from "ioredis";
import { jetstreamPostCreateSchema } from "@vinerima/jetstream-types";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CHANNEL = process.env.REDIS_CHANNEL ?? "jetstream:posts";

function log(level: string, message: string, context?: unknown): void {
  const ts = new Date().toISOString();
  const fn = level === "error" ? console.error : console.log;
  fn(`[${ts}] [${level.toUpperCase()}] ${message}`, context ?? "");
}

const redis = new Redis(REDIS_URL);

redis.on("error", (err) => {
  log("error", "Redis connection error", err);
});

redis.on("connect", () => {
  log("info", `Connected to Redis at ${REDIS_URL}`);
});

const client = new WebSocketClient({
  service: [
    "wss://jetstream1.us-east.bsky.network/subscribe",
    "wss://jetstream2.us-east.bsky.network/subscribe",
    "wss://jetstream1.us-west.bsky.network/subscribe",
    "wss://jetstream2.us-west.bsky.network/subscribe",
  ],
  queryParams: {
    wantedCollections: "app.bsky.feed.post",
  },
  reconnect: {
    initialDelay: 5000,
    maxDelay: 30000,
    backoffFactor: 1.5,
    maxAttempts: 3,
    maxServiceCycles: 2,
  },
  logger: { enabled: true },
  pingInterval: 10000,
});

client.handle(jetstreamPostCreateSchema, async ({ data }) => {
  try {
    await redis.publish(CHANNEL, JSON.stringify(data));
  } catch (err) {
    log("error", "Failed to publish to Redis", err);
  }
});

client.on("open", () => log("info", `Jetstream connected, publishing to channel "${CHANNEL}"`));
client.on("error", (err) => log("error", "Jetstream error", err));
client.on("reconnecting", (info) => log("info", "Jetstream reconnecting", info));

client.connect();

log("info", "jetstream-relay started");
