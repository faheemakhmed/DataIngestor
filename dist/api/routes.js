"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const source_controller_1 = require("../modules/sources/source.controller");
const queue_controller_1 = require("../modules/queue/queue.controller");
const records_controller_1 = require("../modules/records/records.controller");
const auth_controller_1 = require("../modules/auth/auth.controller");
const auth_middleware_1 = require("../modules/auth/auth.middleware");
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
/**
 * @swagger
 * /api/sources:
 *   get:
 *     summary: Get all sources
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sources
 *   post:
 *     summary: Create a new source
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [API, RSS, CSV, JSON]
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Source created
 *       400:
 *         description: Validation error
 */
/**
 * @swagger
 * /api/sources/{id}:
 *   get:
 *     summary: Get source by ID
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Source details
 *       404:
 *         description: Source not found
 *   patch:
 *     summary: Update source
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Source updated
 *   delete:
 *     summary: Delete source
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Source deleted
 */
/**
 * @swagger
 * /api/sources/{id}/sync:
 *   post:
 *     summary: Trigger source sync
 *     tags: [Sources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       202:
 *         description: Sync initiated
 */
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, DEAD_LETTER]
 *     responses:
 *       200:
 *         description: List of jobs
 */
/**
 * @swagger
 * /api/jobs/{jobId}/reprocess:
 *   post:
 *     summary: Retry a failed job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job requeued
 */
/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all records
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Paginated list of records
 */
/**
 * @swagger
 * /api/records/enriched:
 *   get:
 *     summary: Get enriched records
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enriched records
 */
/**
 * @swagger
 * /api/pipeline/reprocess:
 *   post:
 *     summary: Reprocess from specific stage
 *     tags: [Pipeline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rawRecordId:
 *                 type: string
 *               normalizedRecordId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job created
 *       400:
 *         description: Invalid request
 */
const router = (0, express_1.Router)();
router.post('/auth/register', auth_controller_1.authController.register);
router.post('/auth/login', auth_controller_1.authController.login);
router.get('/sources', auth_middleware_1.authenticate, source_controller_1.sourceController.getAll);
router.post('/sources', auth_middleware_1.authenticate, source_controller_1.sourceController.create);
router.get('/sources/:id', auth_middleware_1.authenticate, source_controller_1.sourceController.getById);
router.patch('/sources/:id', auth_middleware_1.authenticate, source_controller_1.sourceController.update);
router.delete('/sources/:id', auth_middleware_1.authenticate, source_controller_1.sourceController.delete);
router.post('/sources/:id/sync', auth_middleware_1.authenticate, source_controller_1.sourceController.sync);
router.get('/sources/:id/checkpoint', auth_middleware_1.authenticate, source_controller_1.sourceController.getCheckpoint);
router.get('/jobs', auth_middleware_1.authenticate, queue_controller_1.queueController.getJobs);
router.get('/jobs/:id/logs', auth_middleware_1.authenticate, queue_controller_1.queueController.getJobLogs);
router.post('/jobs/:jobId/reprocess', auth_middleware_1.authenticate, queue_controller_1.queueController.reprocess);
router.post('/jobs/:jobId/reprocess-dead-letter', auth_middleware_1.authenticate, queue_controller_1.queueController.reprocessDeadLetter);
router.get('/records', auth_middleware_1.authenticate, records_controller_1.recordsController.getAll);
router.get('/records/:id', auth_middleware_1.authenticate, records_controller_1.recordsController.getById);
router.get('/records/enriched', auth_middleware_1.authenticate, records_controller_1.recordsController.getEnriched);
router.post('/pipeline/reprocess', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { rawRecordId, normalizedRecordId } = req.body;
        const { createNormalizeJob, createEnrichJob } = await Promise.resolve().then(() => __importStar(require('../modules/queue/queue.service')));
        if (rawRecordId) {
            const job = await createNormalizeJob(rawRecordId);
            res.json({ message: 'Normalization job created', job });
        }
        else if (normalizedRecordId) {
            const job = await createEnrichJob(normalizedRecordId);
            res.json({ message: 'Enrichment job created', job });
        }
        else {
            res.status(400).json({ error: 'Provide rawRecordId or normalizedRecordId' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map