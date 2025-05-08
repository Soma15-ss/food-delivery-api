// controllers/userController.js
const { Messages } = require('../helpers/Messages')
const { GenerateToken } = require('../middleware/auth_middleware')
const tokenModel = require('../models/tokenModel')
const userModel = require('../models/userModel')

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: Messages.LOGIN_FIELDS_REQUIRED })
    }

    // Check if user already exists
    const userExists = await userModel.findOne({ username })
    if (userExists) {
      return res.status(400).json({ message: Messages.USER_EXISTS })
    }

    // Create and save the user
    const newUser = new userModel({
      username,
      password,
      role: role || 'user' // Default role is 'user'
    })

    const savedUser = await newUser.save()
    res.status(201).json({
      message: Messages.REGISTER_SUCCESS,
      user: savedUser,
      statusCode: 201
    })
  } catch (error) {
    res.status(500).json({ message: Messages.SERVER_ERROR })
  }
}

// Login a user
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: Messages.LOGIN_FIELDS_REQUIRED })
    }

    // Check if the user exists
    const user = await userModel.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: Messages.INVALID_CREDENTIALS })
    }

    // Check if the password matches
    const isMatch = password === user.password
    if (!isMatch) {
      return res.status(401).json({ message: Messages.INVALID_CREDENTIALS })
    }

    // Generate a token
    const token = GenerateToken(user._id)

    const existingToken = await tokenModel.findOne({ userId: user?._id })

    // If token exists, update it
    if (existingToken) {
      await tokenModel.findByIdAndUpdate(
        existingToken?._id,
        { token: token },
        { new: true }
      )
    } else {
      // Save the new token
      const newToken = new tokenModel({
        userId: user._id,
        userType: user.role,
        token: token
      })
      await newToken.save()
    }

    res.status(200).json({
      message: Messages.LOGIN_SUCCESS,
      token,
      user: { username: user.username, role: user.role },
      statusCode: 200
    })
  } catch (err) {
    return sendResponse(res, 500, null, err.message)
  }
}
