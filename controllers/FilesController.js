import dbClient from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const redisClient = require('../utils/redis');

class FilesController {
    // Endpoint to upload
    static async postUpload(req, res) {

        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        // checking if user is based on the token
        const user = req.user;

        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        // Check name field
        if (!name) {
            return res.status(400).send("Missing name");
        }

        // Check type field must be folder, file or image
        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).send("Missing type");
        }

        // check data is provided
        if (!data && type != 'folder') {
            return res.status(400).send("Missing data");
        }

        // Check if valid parent folder exists if parentId is provided
        let parent = null;
        if (parentId !== '0') {
            parent = await dbClient.collection('files').findOne({_id: new ObjectId(parentId) });

            // Check parent file exist or not, return an error
            if (!parent) {
                return res.status(400).send("Parent not found");
            }

            // check if parent file is type folder and if it exists
            if (parent.type !== 'folder') {
                return res.status(400).send("Parent is not a folder");
            }
        }

         // new file doc with needed fields
        const newFile = {
            userId: user._id,
            name,
            type,
            parentId: parentId === '0' ? null : ObjectId(parentId),
            isPublic,
        };

        // handling data storage for type
        if (type === 'file' || type === 'image') {
            const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

            // Check if folder path exists or to create it
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Generate unique filename and save file
            const filename = uuidv4();
            const filePath = path.join(folderPath, filename);
            fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
            newFile.localPath = filePath; // Store file path in doc
        }

        // Insert new file document into the files
        const result = await dbClient.collection('files').insertOne(newFile);
        return res.status(201).send(result.ops[0]);
    }

    // Endpoint to publish a file
    static async putPublish(req, res) {
        const token = req.headers['x-token'];
        const userId = await redisClient.get(`auth_${token}`);

        // Check user is authenticated
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;

        // Check fileId format
        if (!ObjectId.isValid(fileId)) {
            return res.status(400).json({ error: 'Invalid file' });
        }

        // Get file doc based on fileId and userId
        const file = await dbClient.db.collection('files').findOne({
            _id: ObjectId(fileId),
            userId: ObjectId(userId)
        });

        // if file doesn't exist or found return error
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        // update file to set isPublic is true
        await dbClient.db.collection('files').updateOne(
            { _id: ObjectId(fileId) },
            { $set: { isPublic: true } }
        );

        // Get and return updated file doc
        const updatedFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        return res.status(200).json(updatedFile);
    }

    // Endpoint to unpublish file
    static async putUnpublish(req, res) {
        const token = req.headers['x-token'];
        const userId = await redisClient.get(`auth_${token}`);

        // Check user is authenticated
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;

        // Check fileId format
        if (!ObjectId.isValid(fileId)) {
            return res.status(400).json({ error: 'Invalid file' });
        }

        // Get file doc on fileId and userId
        const file = await dbClient.db.collection('files').findOne({
            _id: ObjectId(fileId),
            userId: ObjectId(userId)
        });

        // check if file is found, return error
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Update file to set isPublic to false
        await dbClient.db.collection('files').updateOne(
            { _id: ObjectId(fileId) },
            { $set: { isPublic: false } }
        );

        // Get and return updated file doc
        const updatedFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        return res.status(200).json(updatedFile);
    }
}

export default FilesController;