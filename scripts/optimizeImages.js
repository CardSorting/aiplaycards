const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_FOLDER = path.resolve(__dirname, '..', 'public', 'assets');

function getAllPngFilesRecursively(startDir) {
  /** @type {string[]} */
  const pngFilePaths = [];

  /** @param {string} currentDir */
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        pngFilePaths.push(fullPath);
      }
    }
  }

  walk(startDir);
  return pngFilePaths;
}

async function optimizePng(filePath) {
  // Use palette-based quantization with high effort for good compression
  // Strip metadata by default
  const image = sharp(filePath, { limitInputPixels: false });
  await image
    .png({
      compressionLevel: 9, // zlib level 0-9
      quality: 80, // 0-100, used for palette quantization
      palette: true, // enable quantization
      effort: 10, // 1-10, CPU effort
      progressive: false,
      force: true,
    })
    .toFile(`${filePath}.tmp`);

  // Replace original file only if we produced output
  fs.copyFileSync(`${filePath}.tmp`, filePath);
  fs.unlinkSync(`${filePath}.tmp`);
}

async function main() {
  if (!fs.existsSync(INPUT_FOLDER)) {
    console.error(`Input folder not found: ${INPUT_FOLDER}`);
    process.exit(1);
  }

  const files = getAllPngFilesRecursively(INPUT_FOLDER);
  if (files.length === 0) {
    console.log('No PNG files found to optimize.');
    return;
  }

  console.log(`Optimizing ${files.length} PNG files...`);

  let optimizedCount = 0;
  for (const file of files) {
    try {
      await optimizePng(file);
      optimizedCount += 1;
      if (optimizedCount % 25 === 0) {
        console.log(`Optimized ${optimizedCount}/${files.length}...`);
      }
    } catch (err) {
      console.warn(
        `Failed to optimize ${file}:`,
        err && err.message ? err.message : err,
      );
    }
  }

  console.log(
    `Optimization complete. Optimized ${optimizedCount}/${files.length} files.`,
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
