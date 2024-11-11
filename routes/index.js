import { Router } from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
import FilesController from '../controllers/UsersController.js';

const router = Router();

// Define the GET /status route
router.get('/status', AppController.getStatus);

// Define the GET /stats route
router.get('/stats', AppController.getStats);

// Define the POST /users route
router.post('/users', UsersController.postNew);

// Add new endpoint
router.post('/files', FilesController.postUpload);

// Export the router
export default router;
