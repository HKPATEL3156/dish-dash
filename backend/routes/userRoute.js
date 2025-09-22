import express from 'express'
import {
  loginUser,
  registerUser,
  getCustomers,
  getAllUsers,
  updateUsersWithRole,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController.js'
import authMiddleware from '../middleware/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/customers', getCustomers)
userRouter.get('/all', getAllUsers) // Debug route
userRouter.post('/update-roles', updateUsersWithRole) // Migration route

// Profile routes (protected)
userRouter.get('/profile', authMiddleware, getUserProfile)
userRouter.put('/profile', authMiddleware, updateUserProfile)

export default userRouter
