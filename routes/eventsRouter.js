/**
 * Events router.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const express = require('express')
const router = express.Router()
const controller = require('../controllers/eventsController')

// routes
router.get('/', controller.index) // All events
router.get('/page/:page', controller.index) // All events
router.get('/add', controller.auth, controller.add)
router.post('/create', controller.auth, controller.create)

router.get('/:id', controller.one) // One specific event
router.get('/:id/remove', controller.auth, controller.remove)
router.post('/:id/delete', controller.auth, controller.delete)
router.get('/:id/edit', controller.auth, controller.edit)
router.post('/:id/update', controller.auth, controller.update)
router.get('/location/:location', controller.location) // By location
router.get('/category/:category', controller.category) // By category
router.get('/like/:id', controller.like) // Like an event
// router.post('/create', controller.auth, controller.create)

module.exports = router
