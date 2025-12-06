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

  const update = {};
  if (status !== undefined) update.status = status;

  if (status === 'not_started') {
    await Progress.deleteOne({ owner: req.user._id, book: book._id });
    return res.json({
      success: true,
      data: { book: book._id, status: 'not_started', pagesRead: 0 },
    });
  }

  if (pagesRead !== undefined) {
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
