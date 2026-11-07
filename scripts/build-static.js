const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const excludedRootFiles = new Set([
  '.env.local',
  '.env.production',
  'package-lock.json',
  'package.json',
  'README.md',
  'vercel.json',
]);

const excludedDirectories = new Set([
  '.git',
  '.vercel',
  'api',
  'db',
  'dist',
  'node_modules',
  'scripts',
]);

function shouldCopy(relativePath, entry) {
  if (entry.isDirectory()) {
    return !excludedDirectories.has(relativePath);
  }

  if (relativePath.startsWith('.env.') || excludedRootFiles.has(relativePath)) {
    return false;
  }

  return true;
}

function copyTree(source, target, relativeDirectory = '') {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const relativePath = relativeDirectory
      ? path.join(relativeDirectory, entry.name)
      : entry.name;

    if (!shouldCopy(relativePath, entry)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyTree(sourcePath, targetPath, relativePath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyTree(root, dist);

console.log('Static build ready:', dist);
