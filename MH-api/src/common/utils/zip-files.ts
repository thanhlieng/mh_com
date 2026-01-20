import archiver from 'archiver';
import { Writable } from 'stream';

/**
 * @param {array<{data: Buffer, name: String}>} files
 * @returns {Promise<Buffer>}
 */
export function zipFiles(files) {
  return new Promise((resolve, reject) => {
    const buffs = [];

    const converter = new Writable();

    converter._write = (chunk, encoding, cb) => {
      buffs.push(chunk);
      process.nextTick(cb);
    };

    converter.on('finish', () => {
      resolve(Buffer.concat(buffs));
    });

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(converter);

    for (const file of files) {
      archive.append(file.buffer, { name: file.filename });
    }

    archive.finalize();
  });
}
