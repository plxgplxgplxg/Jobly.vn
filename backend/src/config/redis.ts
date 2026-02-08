import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

export async function disconnectRedis() {
  try {
    await redisClient.disconnect();
  } catch (error) {
    console.error('Failed to disconnect from Redis:', error);
  }
}
