// Worker.js (Bull module)
const Queue = require('bull');
const { ObjectId } = require('mongodb');
const sharp = require('sharp');
const path = require('path');

// creating a new queue
const fileQueue = new Queue('fileQueue');
const imageWidths = [500, 250, 100]; // Define the widths for the generated thumbnails

async function generateThumbnails(imagePath) {
    // Parse img path to get directory, name and extension
    const { dir, name, ext } = path.parse(imagePath);

    try {
        // Loop through width defined in imageWidths
        for (const width of imageWidths) {
            // Create path for thumbnail with width appended to filename
            const thumbnailPath = path.join(dir, `${name}_${width}${ext}`);

            // Resize img and saved as thumbnail
            await sharp(imagePath).resize(width).toFile(thumbnailPath);
            console.log(`Thumbnail generated ${thumbnailPath}`);
        }
    } catch (error) {
        // if any error occurs, during thumbnail throw error.
        throw new Error('Error');
    }
}

fileQueue.process(async (job, done) => {
    const { fileId, userId } = job.data;

    // Check for file
    if (!fileId) {
        throw new Error('Missing fileId');
    }

    // Check for user
    if (!userId) {
        throw new Error('Missing userId');
    }

    // Find document in database by fileId and userId to ensure user owns the file
    const doc = await dbClient.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
    });

    // Check if doc exists and if it contains localPath field
    if (!doc || !doc.localPath) {
        throw new Error('File not found or path not found');
    };

    // Generate thumbnails for located file
    try {
        await generateThumbnails(doc.localPath); // Generate thumbnails
        done(); // signal successful job completion
    } catch (error) {
        console.error('Error in thumbnail:', error);
        throw error;
    }
});

module.exports = fileQueue;