// AppController.js
const express = require('express');
const RedisUtils = require('../utils/redis');
const DButils = require('../utils/db');

class AppController {
    static async getStatus(req, res) {
        try {
            const redistatus = await RedisUtils.checkRedisConnection();
            const dbstatus = await DButils.checkDbConnection();

            res.status(200).json({ redis: redistatus, db: dbstatus });
        } catch (error) {
            res.status(500).json({ error: 'Error status' });
        }
    }

    static async getStats(req, res) {
        try {
            const userStats = await DButils.countUsers();
            const filesStats = await DButils.countFiles();

            res.status(200).json({ users: userStats, files: filesStats });
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    }
}

module.exports = AppController;