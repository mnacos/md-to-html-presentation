import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read file content asynchronously
 * @param {string} filePath - Path to file
 * @param {string} encoding - File encoding (default: 'utf-8')
 * @returns {Promise<string>} File content
 */
export async function readFile(filePath, encoding = 'utf-8') {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return fs.promises.readFile(absolutePath, encoding);
}

/**
 * Write content to file
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @param {string} encoding - File encoding (default: 'utf-8')
 */
export async function writeFile(filePath, content, encoding = 'utf-8') {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const dir = path.dirname(absolutePath);
  await ensureDirectory(dir);

  return fs.promises.writeFile(absolutePath, content, encoding);
}

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
export async function ensureDirectory(dirPath) {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  if (!fs.existsSync(absolutePath)) {
    await fs.promises.mkdir(absolutePath, { recursive: true });
  }

  return absolutePath;
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
export async function fileExists(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return fs.promises.access(absolutePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

/**
 * Read directory contents
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} Array of file names
 */
export async function readDirectory(dirPath) {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  return fs.promises.readdir(absolutePath);
}

/**
 * Get all markdown files from a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} Array of markdown file paths
 */
export async function getMarkdownFiles(dirPath) {
  const files = await readDirectory(dirPath);
  return files
    .filter(file => file.endsWith('.md') || file.endsWith('.markdown'))
    .map(file => path.join(dirPath, file));
}

/**
 * Delete file
 * @param {string} filePath - Path to file
 */
export async function deleteFile(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (await fileExists(absolutePath)) {
    await fs.promises.unlink(absolutePath);
  }
}

/**
 * Delete directory and contents
 * @param {string} dirPath - Directory path
 */
export async function deleteDirectory(dirPath) {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  if (fs.existsSync(absolutePath)) {
    await fs.promises.rm(absolutePath, { recursive: true, force: true });
  }
}

/**
 * Copy file
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
export async function copyFile(src, dest) {
  const srcPath = path.isAbsolute(src) ? src : path.resolve(process.cwd(), src);
  const destPath = path.isAbsolute(dest) ? dest : path.resolve(process.cwd(), dest);

  await ensureDirectory(path.dirname(destPath));
  return fs.promises.copyFile(srcPath, destPath);
}

/**
 * Get project root directory
 * @returns {string} Project root path
 */
export function getProjectRoot() {
  return path.resolve(__dirname, '..', '..');
}

/**
 * Get content directory path
 * @returns {string} Content directory path
 */
export function getContentDir() {
  return path.join(getProjectRoot(), 'content');
}

/**
 * Get dist directory path
 * @returns {string} Dist directory path
 */
export function getDistDir() {
  return path.join(getProjectRoot(), 'dist');
}

/**
 * Check if directory exists
 * @param {string} dirPath - Directory path
 * @returns {Promise<boolean>} True if directory exists
 */
export async function directoryExists(dirPath) {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(process.cwd(), dirPath);

  try {
    const stats = await fs.promises.stat(absolutePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get file extension from path
 * @param {string} filePath - File path
 * @returns {string} File extension (lowercase, without dot)
 */
export function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase().replace('.', '');
}

/**
 * Get base name from path
 * @param {string} filePath - File path
 * @returns {string} File name without extension
 */
export function getBaseName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}
