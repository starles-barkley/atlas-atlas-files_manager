import sha1 from 'sha1';
import dbClient from '../utils/db.js';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is missing
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the user already exists in the database
    const userCollection = dbClient.db.collection('users');
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Insert the new user into the database
    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await userCollection.insertOne(newUser);
      // Return the new user with only the id and email
      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  }
}

export default UsersController;