/**
 * Home router.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const express = require('express')
const router = express.Router()
const controller = require('../controllers/homeController')

// routes
router.get('/', controller.index)
router.get('/about', controller.about)
router.get('/contact', controller.contact)

module.exports = router
