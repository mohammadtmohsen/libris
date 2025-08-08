import Routine from '../models/Routine.js';

const getAllRoutines = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  const routines = await Routine.find({ user: userId });

  res.status(200).json({ items: routines, count: routines?.length });
};

const createRoutine = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  const routineData = { ...req.body, user: userId };

  const routine = await Routine.create({
    ...routineData,
    status: 'inactive',
    time: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activatedAt: null,
    },
  });
  if (!routine) {
    res.status(400).json({ message: 'Routine is not created' });
  } else {
    res.status(201).json({ routine, message: `Routine created successfully` });
  }
};

const activateRoutine = async (req, res) => {
  const userId = req.user._id;

  // Deactivate all routines
  await Routine.updateMany(
    { user: userId },
    {
      status: 'inactive',
      'time.activatedAt': null,
    }
  );

  const routine = await Routine.findByIdAndUpdate(
    { _id: req.params.id, user: userId },
    {
      status: 'active',
      'time.activatedAt': Date.now(),
    },
    { new: true }
  );
  if (!routine) {
    res.status(404).json({ message: 'Routine not found' });
  } else {
    res
      .status(200)
      .json({ routine, message: 'Routine activated successfully' });
  }
};

const getActiveRoutine = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  const routine = await Routine.findOne({
    user: userId,
    status: 'active',
  });

  if (!routine) {
    res.status(404).json({ message: 'Active routine not found' });
  } else {
    res.status(200).json(routine);
  }
};
// Get routine by ID
const getRoutineById = async (req, res) => {
  const routine = await Routine.findById(req.params.id);
  if (!routine) {
    res.status(404).json({ message: 'Routine not found' });
  } else {
    res.status(200).json(routine);
  }
};

const updateRoutine = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the routine first to verify ownership
    const existingRoutine = await Routine.findById(req.params.id);

    if (!existingRoutine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // Verify user owns this routine
    if (existingRoutine.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to update this routine' });
    }

    // Prepare update data
    const updatedData = {
      ...req.body,
      'time.updatedAt': Date.now(),
    };

    // Perform the update with validation
    const routine = await Routine.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ routine, message: 'Routine updated successfully' });
  } catch (error) {
    console.error('Error updating routine:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Handle other errors
    res.status(500).json({
      message: 'Server error while updating routine',
      error: error.message,
    });
  }
};

const deleteRoutine = async (req, res) => {
  const routine = await Routine.findByIdAndDelete(req.params.id);
  if (!routine) {
    res.status(404).json({ message: 'Routine not found' });
  } else {
    res.status(200).json({ message: 'Routine deleted successfully' });
  }
};

export {
  getAllRoutines,
  createRoutine,
  activateRoutine,
  updateRoutine,
  deleteRoutine,
  getActiveRoutine,
  getRoutineById,
};
