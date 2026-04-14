import { Router } from 'express';
import { sourceController } from '@/modules/sources/source.controller';
import { queueController } from '@/modules/queue/queue.controller';
import { recordsController } from '@/modules/records/records.controller';
import { authController } from '@/modules/auth/auth.controller';
import { authenticate } from '@/modules/auth/auth.middleware';

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