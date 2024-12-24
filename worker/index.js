const keys = require('./keys');
const { createClient } = require('redis');

// Create the main Redis client
const redisClient = createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

// Duplicate the Redis client for subscribing
const sub = redisClient.duplicate();

sub.on('error', (err) => console.error('Redis Subscriber Error', err));

(async () => {
  await sub.connect();
})();

// Fibonacci calculation
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// Subscribe to the 'insert' channel and handle messages
sub.subscribe('insert', async (message) => {
  try {
    await redisClient.hSet('values', message, fib(parseInt(message)));
  } catch (err) {
    console.error('Error processing message:', err);
  }
});
