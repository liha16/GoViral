/**
 * Users schema model.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Create a schema.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [1, 'Too short username'],
    maxlength: [50, 'Too long username']
  },
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Too long name']
  },
  surname: {
    type: String,
    required: true,
    maxlength: [100, 'Too long surname']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: [200, 'Too long surname']
  },
  admin: {
    type: Boolean,
    required: true,
    default: false
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'The password must be at least 8 characters long'],
    maxlength: [500, 'Too long pasword']
  },
  passToken: {
    type: String,
    default: ''
  },
  passDate: {
    type: Date,
    default: ''
  }

}, {
  timestamps: true,
  versionKey: false
})

// Hash passwords
userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

// Compare passwords
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Something went wrong, try again!')
  }
  return user
}

// Create a model using the schema.
const User = mongoose.model('User', userSchema)

// Exports.
module.exports = User
