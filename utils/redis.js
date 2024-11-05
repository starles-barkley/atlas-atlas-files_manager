const redis = require('redis');

// Creating redis client class
class RedisClient {
    constructor() {
        // Creating redis client
        this.client = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        });

        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });
    }
        isAlive() {
            return this.client.connected;
        }

        async get(key) {
            
        }
    }