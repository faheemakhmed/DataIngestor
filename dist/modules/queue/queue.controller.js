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
exports.queueController = exports.QueueController = void 0;
const zod_1 = require("zod");
const queue_service_1 = require("./queue.service");
const client_1 = require("@prisma/client");
const reprocessJobSchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid(),
});
class QueueController {
    async getJobs(req, res, next) {
        try {
            const type = req.query.type;
            const status = req.query.status;
            const limit = parseInt(req.query.limit || '100', 10);
            const { jobRepository } = await Promise.resolve().then(() => __importStar(require('./queue.repository')));
            const jobs = await jobRepository.findPending(type || client_1.JobType.INGEST, limit);
            res.json({ jobs, count: jobs.length });
        }
        catch (error) {
            next(error);
        }
    }
    async getJobLogs(req, res, next) {
        try {
            const { id } = req.params;
            const { job, logs } = await (0, queue_service_1.getJobWithLogs)(id);
            if (!job) {
                res.status(404).json({ error: 'Job not found' });
                return;
            }
            res.json({ job, logs });
        }
        catch (error) {
            next(error);
        }
    }
    async reprocess(req, res, next) {
        try {
            const { jobId } = req.params;
            const job = await (0, queue_service_1.reprocessJob)(jobId);
            res.json({ message: 'Job requeued', job });
        }
        catch (error) {
            next(error);
        }
    }
    async reprocessDeadLetter(req, res, next) {
        try {
            const { jobId } = req.params;
            const job = await (0, queue_service_1.reprocessDeadLetter)(jobId);
            res.json({ message: 'Dead letter job requeued', job });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.QueueController = QueueController;
exports.queueController = new QueueController();
//# sourceMappingURL=queue.controller.js.map