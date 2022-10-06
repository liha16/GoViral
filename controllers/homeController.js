/**
 * Home Controller.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const homeController = {}

/**
 * View home pages.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
homeController.index = (req, res) => {
  res.render('home/index')
}
/**
 * View about page.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
homeController.about = (req, res) => {
  res.render('home/about')
}
/**
 * View contact page.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
homeController.contact = (req, res) => {
  res.render('home/contact')
}

module.exports = homeController
