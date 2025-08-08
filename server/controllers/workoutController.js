import Workout from '../models/Workout.js';

// Function to remove empty string values from the filters object
const cleanFilters = (filters) => {
  const cleanedFilters = {};
  for (const key in filters) {
    if (filters[key] !== '') {
      if (key === 'exercise') {
        cleanedFilters[key] = { $regex: filters[key], $options: 'i' };
      } else {
        cleanedFilters[key] = filters[key];
      }
    }
  }
  return cleanedFilters;
};

const getAllWorkouts = async (req, res) => {
  const filters = req.query;
  const cleanedFilters = cleanFilters(filters);

  const workouts = await Workout.find(cleanedFilters);
  console.log(workouts.length);
  if (!workouts) {
    res.status(404).json({ message: 'No workouts found' });
  } else {
    res.status(200).json({ items: workouts, count: workouts?.length });
  }
};

const createOne = async (req, res) => {
  //! add validation
  const workout = await Workout.create(req.body);
  if (!workout) {
    res.status(400).json({ message: 'Workout is not created' });
  } else {
    res.status(201).json({ workout, message: `Workout created successfully` });
  }
};

const updateOne = async (req, res) => {
  const { id } = req.params;
  const workout = await Workout.findByIdAndUpdate(id, req.body, { new: true });
  if (!workout) {
    res.status(404).json({ message: `Workout with id ${id} not found` });
  } else {
    res.status(200).json({ workout, message: `Workout updated successfully` });
  }
};

const deleteOne = async (req, res) => {
  const { id } = req.params;
  const workout = await Workout.findByIdAndDelete(id);
  if (!workout) {
    res.status(404).json({ message: `Workout with id ${id} not found` });
  } else {
    res.status(200).json({ workout, message: `Workout deleted successfully` });
  }
};

export { getAllWorkouts, createOne, updateOne, deleteOne };
