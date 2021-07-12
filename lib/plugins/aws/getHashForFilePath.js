'use strict';

const memoize = require('memoizee');
const crypto = require('crypto');
const yauzl = require('yauzl');

const getHashForFilePath = memoize(
  async (filePath, encoding = 'base64') => {
    const sortedEntries = (
      await new Promise((resolve, reject) => {
        const entries = [];
        yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
          if (err) reject(err);
          zipfile.readEntry();
          zipfile.on('entry', ({ crc32, uncompressedSize, fileName }) => {
            entries.push({ crc: crc32, size: uncompressedSize, file: fileName });
            zipfile.readEntry();
          });
          zipfile.on('end', () => {
            resolve(entries);
          });
          zipfile.on('error', (error) => reject(error));
        });
      })
    ).sort(({ file: fileA }, { file: fileB }) => {
      if (fileA > fileB) return 1;
      if (fileA < fileB) return -1;
      return 0;
    });

    const hash = crypto.createHash('sha256');
    for (const { crc, size, file } of sortedEntries) {
      hash.update(file + String(crc) + String(size));
    }
    return hash.digest(encoding);
  },
  { promise: true }
);

module.exports = getHashForFilePath;
