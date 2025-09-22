import userModel from '../modals/userModel.js'
import jwt from 'jsonwebtoken'
import bycrypt from 'bcrypt'
import validator from 'validator'

// LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    // CHECK IF USER IS AVAILABLE WITH THIS ID
    let user = await userModel.findOne({ email })

    // Check if this is an admin credential
    const adminEmails = ['dishdash.restora@gmail.com']
    const adminPassword = 'admin@dishdash001'

    if (!user && adminEmails.includes(email)) {
      // Create admin user if doesn't exist
      const salt = await bycrypt.genSalt(10)
      const hashedPassword = await bycrypt.hash(adminPassword, salt)

      user = new userModel({
        username: 'Admin',
        email: email,
        password: hashedPassword,
        role: 'admin'
      })
      await user.save()
    }

    if (!user) {
      return res.json({ success: false, message: "User Doesn't Exist" })
    }

    // MATCHING USER AND PASSWORD
    let isMatch = false

    // For admin, check both hashed and plain password
    if (user.role === 'admin' && adminEmails.includes(email)) {
      isMatch =
        (await bycrypt.compare(password, user.password)) ||
        password === adminPassword
    } else {
      isMatch = await bycrypt.compare(password, user.password)
    }

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid Credentials' })
    }

    // IF PASSWORD MATCHES WE GENERATE TOKENS
    const token = createToken(user._id)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Error' })
  }
}

const createToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET)
}

// REGISTER USER
const registerUser = async (req, res) => {
  const { username, password, email } = req.body
  try {
    // CHECKING IS USER ALREADY EXISTS
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: 'User Already Exists' })
    }

    // VALIDATING EMAIL FORMAT AND STRONG PASSWORD
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please Enter A Valid Email' })
    }

    // PASSWORD IS STRONG
    if (password.length < 8) {
      return res.json({
        success: false,
        message: 'Please Enter A Strong Password'
      })
    }

    // HASING USER PASSWORD
    const salt = await bycrypt.genSalt(10)
    const hashedPassword = await bycrypt.hash(password, salt)

    // Determine role based on email
    const adminEmails = ['dishdash.restora@gmail.com']
    const role = adminEmails.includes(email) ? 'admin' : 'customer'

    // NEW USER
    const newUser = new userModel({
      username: username,
      email: email,
      password: hashedPassword,
      role: role
    })
    // SAVE USER IN THE DATABASE
    const user = await newUser.save()

    // CREATE A TOKEN (ABOVE ||)AND SEND IT TO USER USING RESPONSE
    const token = createToken(user._id)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Error' })
  }
}

// GET ALL CUSTOMERS
const getCustomers = async (req, res) => {
  try {
    console.log('Fetching customers from database...')

    // Get all users with customer role
    const customers = await userModel
      .find({ role: 'customer' })
      .select('-password')

    console.log('Found customers:', customers.length)
    console.log('Customers data:', customers)

    res.json({ success: true, data: customers })
  } catch (error) {
    console.log('Error fetching customers:', error)
    res.json({ success: false, message: 'Error fetching customers' })
  }
}

// GET ALL USERS (for debugging)
const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users from database...')

    const users = await userModel.find().select('-password')

    console.log('Found total users:', users.length)
    console.log('All users data:', users)

    res.json({ success: true, data: users })
  } catch (error) {
    console.log('Error fetching all users:', error)
    res.json({ success: false, message: 'Error fetching users' })
  }
}

// UPDATE EXISTING USERS TO HAVE ROLE FIELD
const updateUsersWithRole = async (req, res) => {
  try {
    console.log('Updating existing users with role field...')

    // Update users without role field to be customers (except admin email)
    const adminEmails = ['dishdash.restora@gmail.com']

    const result = await userModel.updateMany({ role: { $exists: false } }, [
      {
        $set: {
          role: {
            $cond: {
              if: { $in: ['$email', adminEmails] },
              then: 'admin',
              else: 'customer'
            }
          }
        }
      }
    ])

    console.log('Update result:', result)

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} users with role field`,
      result
    })
  } catch (error) {
    console.log('Error updating users:', error)
    res.json({ success: false, message: 'Error updating users' })
  }
}

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id // From auth middleware
    const user = await userModel.findById(userId).select('-password')

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.log('Error fetching user profile:', error)
    res.json({ success: false, message: 'Error fetching profile' })
  }
}

// UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id // From auth middleware
    const { firstName, lastName, phone, address, city, zipCode } = req.body

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          phone,
          address,
          city,
          zipCode
        },
        { new: true, runValidators: true }
      )
      .select('-password')

    if (!updatedUser) {
      return res.json({ success: false, message: 'User not found' })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.log('Error updating user profile:', error)
    res.json({ success: false, message: 'Error updating profile' })
  }
}

export {
  loginUser,
  registerUser,
  getCustomers,
  getAllUsers,
  updateUsersWithRole,
  getUserProfile,
  updateUserProfile
}
