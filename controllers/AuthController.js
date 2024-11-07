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
    const password = sha1(credentials.pass); // Hash the password using SHA1

    try {
      // Search for the user in the MongoDB database
      const user = await dbClient.db.collection('users').findOne({ email, password });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a random token
      const token = uuidv4();

      // Store the token in Redis with user ID for
