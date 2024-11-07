import express from 'express'; // Import Express
import routes from './routes/index.js'; // Import routes

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

app.use('/', routes);

const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
