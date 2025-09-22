import mongoose from 'mongoose'

export const connectDB = async () => {
<<<<<<< HEAD
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log('DB CONNECTED')
  } catch (error) {
    console.error('Database connection error:', error.message)
    process.exit(1)
  }
=======
  await mongoose
    .connect(
      'Your_db_link'
    )
    .then(() => console.log('DB CONNECTED'))
>>>>>>> origin/main
}
