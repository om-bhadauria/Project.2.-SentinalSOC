const { Worker } = require('bullmq');
const logger = require('../utils/logger');
const db = require('../db');

// Redis connection from env
const crypto = require('crypto');

const connection = {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
};

const scanWorker = new Worker('scan-jobs', async job => {
    const { url, jobId } = job.data;
    logger.info(`Processing scan job ${jobId}`, { url });

    let verdict = 'clean';
    let details = { score: 10, threat: "Domain appears benign based on lexical checks." };

    try {
        // 1. Simulate fetching headers / sandboxing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Static heuristic checks
        const suspiciousKeywords = ['login', 'free', '.xyz', 'secure-', 'banking', 'credential'];
        const urlLower = url.toLowerCase();
        
        if (suspiciousKeywords.some(kw => urlLower.includes(kw))) {
             verdict = 'malicious';
             details.score = 85 + Math.floor(Math.random() * 10);
             details.threat = "Suspicious keywords detected in URL path or hostname indicative of phishing.";
        }

        // 3. Update job status
        await db.query(`
            UPDATE scan_jobs 
            SET status = 'completed', verdict = $1, details = $2, updated_at = NOW()
            WHERE id = $3
        `, [verdict, JSON.stringify(details), jobId]);

        // 4. Trigger alert if malicious
        if (verdict === 'malicious') {
             const alertId = crypto.randomUUID();
             await db.query(`
                 INSERT INTO alerts (id, type, severity, title, description, source_ip, target_user, system)
                 VALUES ($1, 'phishing_attempt', 'high', 'Malicious URL Detected', $2, $3, 'system_scan', 'URL_Sandbox')
             `, [alertId, details.threat, new URL(url.startsWith('http') ? url : `https://${url}`).hostname]);

             logger.warn(`Generated alert ${alertId} for malicious URL ${url}`);
             // TODO: Trigger external webhook here if configured
        }

        return { status: 'completed', verdict };
    } catch (err) {
        logger.error(`Error processing job ${jobId}: ${err.message}`);
        await db.query('UPDATE scan_jobs SET status = $1 WHERE id = $2', ['failed', jobId]);
        throw err;
    }
}, { connection });

scanWorker.on('completed', job => {
    logger.info(`Job ${job.id} completed! Verdict recorded.`);
});

scanWorker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with ${err.message}`);
});

logger.info('Scan Worker started and listening for scan-jobs...');
