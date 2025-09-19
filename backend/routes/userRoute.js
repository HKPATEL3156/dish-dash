import express from 'express'
import {
  loginUser,
  registerUser,
  getCustomers,
  getAllUsers,
  updateUsersWithRole
} from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/customers', getCustomers)
userRouter.get('/all', getAllUsers) // Debug route
userRouter.post('/update-roles', updateUsersWithRole) // Migration route

export default userRouter
