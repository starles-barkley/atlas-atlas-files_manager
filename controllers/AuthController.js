const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const BasicAuth = require('basic-auth');

class AuthController {
  static async getConnect(req, res) {
    // Parse Authorization header for Basic Auth (email:password)
    const credentials = BasicAuth(req);

    if (!credentials || !credentials.name || !credentials.pass) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const email = credentials.name;
    const password = sha1(credentials.pass);

    try {
      // Search for the user in the MongoDB database
      const user = await dbClient.db.collection('users').findOne({ email, password });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a random token
      const token = uuidv4();

      // Store the token in Redis with user ID for 24 hours
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 60 * 60 * 24);

      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Remove the token from Redis
    await redisClient.del(key);

    return res.status(204).send(); // No content
  }
}

module.exports = AuthController;
