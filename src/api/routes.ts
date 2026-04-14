import { Router } from 'express';
import { sourceController } from '@/modules/sources/source.controller';
import { queueController } from '@/modules/queue/queue.controller';
import { recordsController } from '@/modules/records/records.controller';
import { authController } from '@/modules/auth/auth.controller';
import { authenticate } from '@/modules/auth/auth.middleware';

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

const router = Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/sources', authenticate, sourceController.getAll);
router.post('/sources', authenticate, sourceController.create);
router.get('/sources/:id', authenticate, sourceController.getById);
router.patch('/sources/:id', authenticate, sourceController.update);
router.delete('/sources/:id', authenticate, sourceController.delete);
router.post('/sources/:id/sync', authenticate, sourceController.sync);
router.get('/sources/:id/checkpoint', authenticate, sourceController.getCheckpoint);

router.get('/jobs', authenticate, queueController.getJobs);
router.get('/jobs/:id/logs', authenticate, queueController.getJobLogs);
router.post('/jobs/:jobId/reprocess', authenticate, queueController.reprocess);
router.post('/jobs/:jobId/reprocess-dead-letter', authenticate, queueController.reprocessDeadLetter);

router.get('/records', authenticate, recordsController.getAll);
router.get('/records/:id', authenticate, recordsController.getById);
router.get('/records/enriched', authenticate, recordsController.getEnriched);

router.post('/pipeline/reprocess', authenticate, async (req, res, next) => {
  try {
    const { rawRecordId, normalizedRecordId } = req.body;
    const { createNormalizeJob, createEnrichJob } = await import('@/modules/queue/queue.service');
    
    if (rawRecordId) {
      const job = await createNormalizeJob(rawRecordId);
      res.json({ message: 'Normalization job created', job });
    } else if (normalizedRecordId) {
      const job = await createEnrichJob(normalizedRecordId);
      res.json({ message: 'Enrichment job created', job });
    } else {
      res.status(400).json({ error: 'Provide rawRecordId or normalizedRecordId' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;