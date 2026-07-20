const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6380');

redis.flushall().then(() => {
  console.log('Cache flushed successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Error flushing cache:', err);
  process.exit(1);
});
