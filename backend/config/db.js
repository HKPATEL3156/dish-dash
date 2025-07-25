import mongoose from 'mongoose'

export const connectDB = async () => {
  await mongoose
    .connect(
      'Your_db_link'
    )
    .then(() => console.log('DB CONNECTED'))
}
