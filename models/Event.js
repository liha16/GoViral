/**
 * Snippets schema model.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const mongoose = require('mongoose')

// Create a schema.
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Too long title']
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Too long description']
  },
  categories: {
    type: Array,
    required: true
  },
  owner: {
    type: String,
    required: true,
    minlength: 1
  },
  address: {
    type: String,
    required: true,
    maxlength: [100, 'Too long address']
  },
  city: {
    type: String,
    required: true,
    maxlength: [100, 'Too long city name']
  },
  country: {
    type: String,
    required: true,
    maxlength: [100, 'Too long country name']
  },
  likes: {
    type: Array,
    required: true
  },
  shares: {
    type: Array,
    required: true
  },
  image: {
    type: String,
    maxlength: [500, 'Too long image url']
  },
  start: {
    type: Date,
    required: true,
    minlength: 1
  },
  end: {
    type: Date,
    required: true,
    minlength: 1
  }
}, {
  timestamps: true
})

// Create a model using the schema.
const Event = mongoose.model('Event', eventSchema)

// Exports.
module.exports = Event
