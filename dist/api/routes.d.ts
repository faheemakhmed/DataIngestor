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
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=routes.d.ts.map