import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import Progress from '../models/Progress.js';

export const getProgressForBook = asyncHandler(async (req, res) => {
  const progress =
    (await Progress.findOne({
      owner: req.user._id,
      book: req.params.bookId,
    }).lean()) || {
      book: req.params.bookId,
      status: 'not_started',
      pagesRead: 0,
      wantToReadAt: null,
      startedAt: null,
      finishedAt: null,
      abandonedAt: null,
    };

  res.json({ success: true, data: progress });
});

export const upsertProgress = asyncHandler(async (req, res) => {
  const { status, pagesRead } = req.body;

  if (status === undefined && pagesRead === undefined) {
    return res
      .status(400)
      .json({ success: false, error: 'No progress fields provided' });
  }

  const book = await Book.findOne({
    _id: req.params.bookId,
  }).select('_id pageCount');

  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  const totalPages =
    typeof book.pageCount === 'number' && book.pageCount >= 0
      ? book.pageCount
      : 0;

  if (status === 'not_started') {
    await Progress.deleteOne({ owner: req.user._id, book: book._id });
    return res.json({
      success: true,
      data: {
        book: book._id,
        status: 'not_started',
        pagesRead: 0,
        wantToReadAt: null,
        startedAt: null,
        finishedAt: null,
        abandonedAt: null,
      },
    });
  }

  const existingProgress =
    (await Progress.findOne({
      owner: req.user._id,
      book: book._id,
    }).select('status wantToReadAt startedAt finishedAt abandonedAt')) || null;

  const update = {};
  const statusChanged =
    status !== undefined && status !== existingProgress?.status;

  if (status !== undefined) {
    update.status = status;
    const now = new Date();
    const statusFieldMap = {
      want_to_read: 'wantToReadAt',
      reading: 'startedAt',
      finished: 'finishedAt',
      abandoned: 'abandonedAt',
    };
    const timestampField =
      status && statusFieldMap[status]
        ? statusFieldMap[status]
        : undefined;

    if (
      timestampField &&
      (statusChanged || !existingProgress?.[timestampField])
    ) {
      update[timestampField] = now;
    }
  }

  if (status === 'finished') {
    update.pagesRead = totalPages;
  } else if (pagesRead !== undefined) {
    update.pagesRead = pagesRead;
  }

  const progress = await Progress.findOneAndUpdate(
    { owner: req.user._id, book: book._id },
    {
      $set: {
        owner: req.user._id,
        book: book._id,
        ...update,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: progress });
});
