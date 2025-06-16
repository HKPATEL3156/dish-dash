import mongoose from 'mongoose'

export const connectDB = async () => {
  await mongoose
    .connect(
      'mongodb+srv://hetpatel02684:het02684@cluster0.ulgludy.mongodb.net/DishDash'
    )
    .then(() => console.log('DB CONNECTED'))
}
