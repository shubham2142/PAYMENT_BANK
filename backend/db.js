const mongoose = require('mongoose');

const connectToDb= async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1); // Exit if connection fails
  }
};



module.exports = connectToDb;
 