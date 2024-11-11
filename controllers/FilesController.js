import dbClient from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
const fs = require('fs');
const path = require('path');

class FilesController {
    static async postUpload(req, res) {

        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        // checking if user is based on the token
        const user = req.user;

        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        if (!name) {
            return res.status(400).send("Missing name");
        }

        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).send("Missing type");
        }

        if (!data && type != 'folder') {
            return res.status(400).send("Missing data");
        }

        let parent = null;
        if (parentId !== '0') {
            parent = await dbClient.collection('files').findOne({_id: new ObjectId(parentId) });

            // Check parent file exist or not
            if (!parent) {
                return res.status(400).send("Parent not found");
            }

            // check if parent file is type folder
            if (parent.type !== 'folder') {
                return res.status(400).send("Parent is not a folder");
            }
        }

         // new file doc
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
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const filename = uuidv4();
            const filePath = path.join(folderPath, filename);
            fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
            newFile.localPath = filePath;
        }

        const result = await dbClient.collection('files').insertOne(newFile);
        return res.status(201).send(result.ops[0]);
    }
}

export default FilesController;