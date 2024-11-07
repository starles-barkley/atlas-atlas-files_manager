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
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the user already exists
    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password and store the new user
    const hashedPassword = sha1(password);
    const newUser = await dbClient.db.collection('users').insertOne({
      email,
      password: hashedPassword,
    });

    // Return the new user without the password field
    return res.status(201).json({
      id: newUser.insertedId,
      email,
    });
  }
}


module.exports = UsersController;
