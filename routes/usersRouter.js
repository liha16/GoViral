/**
 * Users router.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const express = require('express')
const router = express.Router()

const controller = require('../controllers/usersController')

// routes
router.get('/', controller.add) // Register
router.get('/add', controller.add) // Register
router.post('/create', controller.create) // Add user
router.get('/login', controller.login) // Log in and out page
router.post('/login', controller.loginPost) // Log in post
router.post('/logout', controller.logoutPost) // Log out post
router.get('/forgot', controller.forgot) // Form forgot password
router.post('/forgotPassword', controller.forgotPassword)
router.get('/recoverPassword/:token/:username', controller.recoverPassword)
router.post('/recoverPassword', controller.recoverPasswordPost)
router.get('/profile/:username', controller.auth, controller.profile)
router.post('/profile/update', controller.auth, controller.profileUpdate)
router.get('/delete/:username', controller.auth, controller.delete) // Form to delete account
router.post('/delete', controller.auth, controller.remove) // Deletes account
router.get('/change/:username', controller.auth, controller.change) // Deletes account
router.post('/change', controller.auth, controller.changePassword) // Changes password

module.exports = router
