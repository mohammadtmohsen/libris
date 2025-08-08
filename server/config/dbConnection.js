import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const URI = process.env.ATLAS_URI || '';
    await mongoose.connect(URI);
    console.log('Connected to MongoDB! from Libris Connection');
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;
