const redis = require('redis');

// Creating redis client class
class RedisClient {
    constructor() {
        // Creating redis client
        this.client = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        });

        // Handle connection error
        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        // Handle connection success
        this.client.on('connect', () => {
            console.log('client connected');
        });
    }

    // Check if Redis client is connected
    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, value) => {
                if (err) {
                    console.error('Error', err);
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', duration, (err, reply) => {
                if (err) {
                    console.error('Error', err);
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err) => {
                if (err) {
                    console.error('Error', err);
                    reject(err);
                } else{
                    resolve();
                }
            });
        });
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;