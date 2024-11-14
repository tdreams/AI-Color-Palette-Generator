// test-redis.js
import Redis from "ioredis";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Initialize Redis client using environment variable
const client = new Redis(process.env.REDIS_URL, {
  tls: {}, // Enable TLS if required by Upstash
});

// Handle Redis connection errors gracefully
client.on("error", (err) => {
  console.error("Redis connection error:", err);
  process.exit(1);
});

// Handle successful connection
client.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

// Test setting and getting a value
async function testRedis() {
  try {
    await client.set("foo", "bar");
    const value = await client.get("foo");
    console.log("Value for foo:", value); // Should print 'bar'
    process.exit(0);
  } catch (error) {
    console.error("Error during Redis operations:", error);
    process.exit(1);
  }
}

testRedis();
