/**
 * Bulk import PDFs from a local folder into Libris.
 *
 * Usage:
 *   node scripts/import-books.js <source-folder> [--dry-run] [--no-covers]
 *
 * What it does for each PDF:
 *   1. Reads the Arabic (or any) filename  -> book title
 *   2. Stream-copies file to hub/storage/libris/books/{userId}/{uuid}.pdf
 *   3. Renders first page as JPEG cover -> covers/{userId}/{uuid}.jpg
 *   4. Extracts page count from the PDF
 *   5. Creates a MongoDB Book document with originalName preserved
 *
 * Files are stream-copied to keep memory low on a constrained machine.
 * Cover extraction + page count use pdfjs-dist (same as the client app).
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream/promises';
import mongoose from 'mongoose';
import { createCanvas } from 'canvas';
import dotenv from 'dotenv';

// ── Load env from server/.env ──────────────────────────────────────
const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const SERVER_DIR = path.resolve(SCRIPT_DIR, '..');
dotenv.config({ path: path.join(SERVER_DIR, '.env') });

// ── pdfjs-dist setup (must happen after env, before use) ──────────
// Use the legacy build which works in Node.js without a browser environment.
const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

// ── Config ─────────────────────────────────────────────────────────
const STORAGE_DIR = process.env.STORAGE_DIR;
const MONGO_URI = process.env.ATLAS_URI;
const DRY_RUN = process.argv.includes('--dry-run');
const NO_COVERS = process.argv.includes('--no-covers');
const SOURCE_DIR = process.argv.find((a) => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]);

// Max file size to load into memory for cover extraction (200 MB).
// Larger PDFs still get imported but without a cover.
const COVER_MAX_BYTES = 200 * 1024 * 1024;

// Cover rendering settings (matching the client's pdfCover.ts)
const COVER_MAX_WIDTH = 900;
const COVER_JPEG_QUALITY = 0.9;

// ── Validate args ──────────────────────────────────────────────────
if (!SOURCE_DIR) {
  console.error('Usage: node scripts/import-books.js <source-folder> [--dry-run] [--no-covers]');
  process.exit(1);
}
if (!STORAGE_DIR) {
  console.error('STORAGE_DIR not set in server/.env');
  process.exit(1);
}
if (!MONGO_URI) {
  console.error('ATLAS_URI not set in server/.env');
  process.exit(1);
}

// ── Mongoose Book model (inline to avoid import path issues) ──────
const FileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String },
    pageCount: { type: Number },
  },
  { _id: false }
);

const CoverSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    mime: { type: String },
    size: { type: Number },
    originalName: { type: String },
  },
  { _id: false }
);

const BookSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
    part: { type: Number, min: 1 },
    file: { type: FileSchema, required: true },
    cover: { type: CoverSchema },
    pageCount: { type: Number, default: 0, min: 0 },
    publicationYear: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

// ── Helpers ────────────────────────────────────────────────────────

/** Scan source directory for PDFs recursively. */
function scanPdfsRecursive(dir, base = dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanPdfsRecursive(full, base));
    } else if (entry.name.toLowerCase().endsWith('.pdf')) {
      results.push({ absolute: full, relative: path.relative(base, full) });
    }
  }
  return results;
}

/** Stream-copy a file (memory safe for any size). */
async function copyFile(src, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await pipeline(
    fs.createReadStream(src),
    fs.createWriteStream(dest)
  );
}

/**
 * Parse author, title, and publicationYear from a filename.
 * Ported from client/src/utils/bookMetadata.ts — same logic.
 *
 * Supported formats:
 *   "Author - Year Title.pdf"  → { author, publicationYear, title }
 *   "Author - Title.pdf"       → { author, title }
 *   "Author-Title.pdf"         → { author, title }
 *   "Title.pdf"                → { title }
 */
function parseBookMetadataFromFilename(fileName) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const normalized = baseName.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return { title: '' };
  }

  const spacedDashMatch = normalized.match(/\s+-\s+/);
  let author = '';
  let remainder = '';

  if (spacedDashMatch && spacedDashMatch.index !== undefined) {
    const separatorIndex = spacedDashMatch.index;
    author = normalized.slice(0, separatorIndex).trim();
    remainder = normalized.slice(separatorIndex + spacedDashMatch[0].length).trim();
  } else {
    const dashIndex = normalized.indexOf('-');
    if (dashIndex === -1) {
      return { title: normalized };
    }
    author = normalized.slice(0, dashIndex).trim();
    remainder = normalized.slice(dashIndex + 1).trim();
  }

  if (!remainder) {
    return { title: normalized };
  }

  let title = remainder;
  let publicationYear;
  const yearMatch = remainder.match(/^(\d{3,4})(?:\s+|[-_]+(?!\d))(.+)$/);

  if (yearMatch) {
    const parsedYear = Number(yearMatch[1]);
    if (!Number.isNaN(parsedYear)) {
      publicationYear = parsedYear;
      title = yearMatch[2].trim();
    }
  }

  if (!title) {
    title = normalized;
  }

  return {
    title,
    author: author || undefined,
    publicationYear,
  };
}

/**
 * Extract page count + cover image from a PDF.
 * Returns { pageCount, coverBuffer, coverSize } or partial results on failure.
 */
async function extractPdfInfo(filePath, fileSize) {
  const result = { pageCount: 0, coverBuffer: null, coverSize: 0 };

  if (fileSize > COVER_MAX_BYTES) {
    return result; // too large to load into memory
  }

  let doc = null;
  try {
    const data = new Uint8Array(await fs.promises.readFile(filePath));
    doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
    result.pageCount = doc.numPages;

    // Render first page as cover
    if (!NO_COVERS) {
      const page = await doc.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(4, COVER_MAX_WIDTH / baseViewport.width);
      const viewport = page.getViewport({ scale });

      const width = Math.floor(viewport.width);
      const height = Math.floor(viewport.height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // White background (PDFs may have transparent backgrounds)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();

      const jpegBuffer = canvas.toBuffer('image/jpeg', { quality: COVER_JPEG_QUALITY });
      result.coverBuffer = jpegBuffer;
      result.coverSize = jpegBuffer.length;
    }
  } catch {
    // partial results are fine — we still import the book
  } finally {
    if (doc) {
      try { await doc.destroy(); } catch { /* ignore */ }
    }
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const user = await mongoose.connection.db.collection('users').findOne();
  if (!user) {
    console.error('No user found in libris.users — create one first via the app.');
    process.exit(1);
  }
  const userId = user._id.toString();
  console.log(`Owner: ${user.username || user.email || userId}`);
  if (NO_COVERS) console.log('Covers: disabled (--no-covers)');

  // Check for existing books to avoid duplicates
  const existingNames = new Set(
    (await Book.find({ owner: user._id }, { 'file.originalName': 1 }).lean())
      .map((b) => b.file?.originalName)
      .filter(Boolean)
  );

  const resolved = path.resolve(SOURCE_DIR);
  if (!fs.existsSync(resolved)) {
    console.error(`Source folder not found: ${resolved}`);
    process.exit(1);
  }

  const pdfs = scanPdfsRecursive(resolved);
  console.log(`Found ${pdfs.length} PDFs in ${resolved}`);

  if (pdfs.length === 0) {
    console.log('Nothing to import.');
    await mongoose.disconnect();
    return;
  }

  if (DRY_RUN) {
    console.log('\n--- DRY RUN (no files will be copied or DB records created) ---\n');
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < pdfs.length; i++) {
    const { absolute: srcPath, relative: relPath } = pdfs[i];
    const fileName = path.basename(relPath);
    const parsed = parseBookMetadataFromFilename(fileName);
    const title = parsed.title || fileName.replace(/\.[^.]+$/, '');
    const stat = fs.statSync(srcPath);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(1);

    const progress = `[${i + 1}/${pdfs.length}]`;

    if (existingNames.has(fileName)) {
      console.log(`${progress} SKIP (already exists): ${fileName}`);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`${progress} WOULD IMPORT: ${fileName} (${sizeMB} MB)`);
      imported++;
      continue;
    }

    try {
      const bookUuid = randomUUID();
      const bookKey = `books/${userId}/${bookUuid}.pdf`;
      const bookDest = path.join(STORAGE_DIR, bookKey);

      // 1. Stream-copy PDF to storage
      await copyFile(srcPath, bookDest);

      // 2. Extract page count + cover
      const { pageCount, coverBuffer, coverSize } = await extractPdfInfo(srcPath, stat.size);

      // 3. Save cover if extracted
      let coverData = undefined;
      if (coverBuffer) {
        const coverUuid = randomUUID();
        const coverKey = `covers/${userId}/${coverUuid}.jpg`;
        const coverDest = path.join(STORAGE_DIR, coverKey);
        await fs.promises.mkdir(path.dirname(coverDest), { recursive: true });
        await fs.promises.writeFile(coverDest, coverBuffer);

        coverData = {
          key: coverKey,
          mime: 'image/jpeg',
          size: coverSize,
          originalName: `${title}-cover.jpg`,
        };
      }

      // 4. Create MongoDB record
      await Book.create({
        owner: user._id,
        title,
        author: parsed.author,
        publicationYear: parsed.publicationYear,
        file: {
          key: bookKey,
          mime: 'application/pdf',
          size: stat.size,
          originalName: fileName,
          pageCount: pageCount || undefined,
        },
        cover: coverData,
        pageCount,
      });

      existingNames.add(fileName);
      imported++;

      const coverTag = coverData ? ', cover OK' : (NO_COVERS ? '' : ', no cover');
      const metaTag = parsed.author ? ` | by ${parsed.author}` : '';
      const yearTag = parsed.publicationYear ? ` (${parsed.publicationYear})` : '';
      console.log(
        `${progress} OK: "${title}"${metaTag}${yearTag} — ${sizeMB} MB, ${pageCount || '?'} pages${coverTag}`
      );
    } catch (err) {
      failed++;
      console.error(`${progress} FAIL: ${fileName} — ${err.message}`);
    }
  }

  console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}, Failed: ${failed}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
