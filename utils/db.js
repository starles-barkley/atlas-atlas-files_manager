import { MongoClient } from 'mongodb'; // Import MongoDB client library

class DBClient {
  constructor() {
    // MongoDB connection details from environment variables or defaults
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // MongoDB URI string
    const uri = `mongodb://${host}:${port}`;
    
    // Create a new MongoDB client and connect to the database
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.dbName = database;

    // Connect to the MongoDB server
    this.client.connect()
      .then(() => {
        console.log('MongoDB client connected successfully');
        this.db = this.client.db(this.dbName);
      })
      .catch((error) => {
        console.error(`MongoDB connection error: ${error.message}`);
      });
  }

  // Check if the MongoDB connection is alive
  isAlive() {
    return this.client && this.client.isConnected();
  }

  // Get the number of users in the "users" collection
  async nbUsers() {
    try {
      const usersCollection = this.db.collection('users');
      const usersCount = await usersCollection.countDocuments();
      return usersCount;
    } catch (error) {
      console.error(`Error counting users: ${error.message}`);
      return 0;
    }
  }

  // Get the number of files in the "files" collection
  async nbFiles() {
    try {
      const filesCollection = this.db.collection('files');
      const filesCount = await filesCollection.countDocuments();
      return filesCount;
    } catch (error) {
      console.error(`Error counting files: ${error.message}`);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
