const { Pool } = require('pg');
const fs = require('fs/promises');
const path = require('path');
const logger = require('../utils/logger');

// Expecting DATABASE_URL in environment, falling back if necessary
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://socadmin:socpassword@localhost:5432/sentinelsoc',
});

pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle Postgres client', { error: err.message });
});

pool.on('connect', (client) => {
    // Basic connection tracking if needed
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    initSchema: async () => {
        const schemaPath = path.join(__dirname, 'init.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        await pool.query(schemaSql);
        logger.info('Postgres schema initialized.');
    },
    pool,
};
