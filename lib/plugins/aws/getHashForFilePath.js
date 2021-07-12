'use strict';

const memoize = require('memoizee');
const crypto = require('crypto');
const yauzl = require('yauzl');

const getHashForFilePath = memoize(
  async (filePath) => {
    const hash = crypto.createHash('sha256');
    return new Promise((resolve, reject) => {
      yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) reject(err);
        zipfile.readEntry();
        zipfile.on('entry', ({ crc32, uncompressedSize, fileName }) => {
          hash.update(String(crc32));
          hash.update(String(uncompressedSize));
          hash.update(fileName);
          zipfile.readEntry();
        });
        zipfile.on('end', () => {
          resolve(hash.digest('base64'));
        });
        zipfile.on('error', (error) => reject(error));
      });
    });
  },
  { promise: true }
);

module.exports = getHashForFilePath;
