import Record from '../models/Record.js';

const getAllRecords = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }
  const sortOrder = req.query.sort === 'desc' ? -1 : 1;

  const records = await Record.find({ user: userId }).sort({ date: sortOrder });
  // Removed populate since these are the logged-in user's records

  res.status(200).json({ items: records, count: records?.length });
};

const createOne = async (req, res) => {
  const recordData = { ...req.body, user: req.user._id }; // Assuming req.user contains the authenticated user

  const record = await Record.create(recordData);
  if (!record) {
    res.status(400).json({ message: 'Record is not created' });
  } else {
    res.status(201).json({ record, message: `Record created successfully` });
  }
};

const createMany = async (req, res) => {
  const records = req.body.map((record) => ({
    ...record,
    user: req.user._id,
  }));

  const createdRecords = await Record.insertMany(records);
  if (!createdRecords) {
    res.status(400).json({ message: 'Records are not created' });
  } else {
    res.status(201).json({
      records: createdRecords,
      message: `Records created successfully`,
    });
  }
};

const getRecordById = async (req, res) => {
  const record = await Record.findById(req.params.id);
  if (!record) {
    res.status(404).json({ message: 'Record not found' });
  } else {
    res.status(200).json({ record });
  }
};

const updateRecord = async (req, res) => {
  const record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    res.status(404).json({ message: 'Record not found' });
  } else {
    res.status(200).json({ record, message: 'Record updated successfully' });
  }
};

const deleteRecord = async (req, res) => {
  const record = await Record.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404).json({ message: 'Record not found' });
  } else {
    res.status(200).json({ message: 'Record deleted successfully' });
  }
};

export {
  getAllRecords,
  createOne,
  createMany,
  getRecordById,
  updateRecord,
  deleteRecord,
};
