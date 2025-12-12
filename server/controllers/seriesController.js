import asyncHandler from 'express-async-handler';
import Series from '../models/Series.js';
import Book from '../models/Book.js';

const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const shapeSeries = (series) => {
  if (!series) return series;
  const raw =
    typeof series.toObject === 'function' ? series.toObject() : { ...series };
  const normalized = { _id: raw._id, name: raw.name };
  if (typeof raw.totalParts === 'number')
    normalized.totalParts = raw.totalParts;
  return normalized;
};

const findByName = async (name, excludeId) => {
  if (!name) return null;
  const query = {
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Series.findOne(query).select('_id');
};

export const getAllSeries = asyncHandler(async (_req, res) => {
  const series = await Series.find({}, '_id name totalParts')
    .sort({ name: 1 })
    .lean();
  res.json({ success: true, data: series.map((s) => shapeSeries(s)) });
});

export const createSeries = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can create series' });
  }

  const name = (req.body.name || '').trim();
  const totalParts =
    req.body.totalParts === null || req.body.totalParts === undefined
      ? undefined
      : req.body.totalParts;

  const existing = await findByName(name);
  if (existing) {
    return res
      .status(409)
      .json({ success: false, error: 'Series with this name already exists' });
  }

  const series = await Series.create({
    name,
    ...(totalParts ? { totalParts } : {}),
  });

  res.status(201).json({ success: true, data: shapeSeries(series) });
});

export const updateSeries = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can update series' });
  }

  const { id } = req.params;
  const updates = {};
  const unsets = {};
  let shouldClearParts = false;

  if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
    const name = (req.body.name || '').trim();
    const duplicate = await findByName(name, id);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: 'Another series already uses this name',
      });
    }
    updates.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'totalParts')) {
    if (req.body.totalParts === null) {
      unsets.totalParts = '';
      shouldClearParts = true;
    } else if (req.body.totalParts !== undefined) {
      updates.totalParts = req.body.totalParts;
    }
  }

  if (Object.keys(updates).length === 0 && Object.keys(unsets).length === 0) {
    return res
      .status(400)
      .json({ success: false, error: 'No updates provided' });
  }

  const series = await Series.findByIdAndUpdate(
    id,
    {
      ...(Object.keys(updates).length ? { $set: updates } : {}),
      ...(Object.keys(unsets).length ? { $unset: unsets } : {}),
    },
    { new: true }
  );

  if (!series) {
    return res.status(404).json({ success: false, error: 'Series not found' });
  }

  let clearedParts = 0;
  if (shouldClearParts) {
    const detach = await Book.updateMany(
      { seriesId: id },
      { $unset: { part: '' } }
    );
    clearedParts = detach.modifiedCount || 0;
  }

  res.json({
    success: true,
    data: { ...shapeSeries(series), ...(shouldClearParts ? { clearedParts } : {}) },
  });
});

export const deleteSeries = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, error: 'Only admins can delete series' });
  }

  const { id } = req.params;
  const series = await Series.findById(id).select('_id name');
  if (!series) {
    return res.status(404).json({ success: false, error: 'Series not found' });
  }

  const detachResult = await Book.updateMany(
    { seriesId: id },
    { $unset: { seriesId: '', part: '' } }
  );

  await Series.deleteOne({ _id: id });
  res.json({
    success: true,
    data: {
      _id: id,
      name: series.name,
      detachedBooks: detachResult.modifiedCount || 0,
    },
  });
});
