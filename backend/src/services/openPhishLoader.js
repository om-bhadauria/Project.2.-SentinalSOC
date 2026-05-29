const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const logger = require('../utils/logger');

class OpenPhishLoader {
  constructor() {
    this.maliciousUrls = new Set();
  }

  async loadFromCsv(filePath) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        logger.warn(`OpenPhish seed file not found: ${filePath}`);
        return resolve();
      }

      logger.info(`Loading OpenPhish feed from: ${filePath}`);
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Assuming CSV has a 'url' column
          if (row.url) {
            this.maliciousUrls.add(row.url.trim());
          }
        })
        .on('end', () => {
          logger.info(`Successfully loaded ${this.maliciousUrls.size} URLs from OpenPhish feed`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Error loading OpenPhish feed', err);
          reject(err);
        });
    });
  }

  isMalicious(url) {
    return this.maliciousUrls.has(url);
  }
}

module.exports = new OpenPhishLoader();
