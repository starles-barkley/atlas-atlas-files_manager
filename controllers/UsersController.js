const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class UsersController {
  static async getMe(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Find the user by their ID in the MongoDB database
      const user = await dbClient.db.collection('users').findOne({ _id: dbClient.objectID(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return the user info (only email and id)
      return res.status(200).json({ id: user._id, email: user.email });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
