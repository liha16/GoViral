/**
 * Users Controller.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const User = require('../models/User')
const Event = require('../models/Event')
const usersController = {}
const nodemailer = require('nodemailer')
const fetch = require('node-fetch')
const validator = require('validator')
const bcrypt = require('bcrypt')
// const test = false
const test = true // testing, comment out above

/**
 * Displays for to register user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.add = (req, res) => {
  res.render('users/add')
}

/**
 * Registers user in databse.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.create = async (req, res) => { // POST
  let isVerified = false
  req.session.flash = { type: 'error', text: 'Could not save new user!' } // By default

  try {
    if (validateName(req.body.username) !== true || validateName(req.body.name) !== true || validateName(req.body.surname) !== true) {
      req.session.flash = { type: 'error', text: 'Not a valid characters or emtpy!' }
      throw new Error()
    }
    if (!validator.isEmail(req.body.email.toLowerCase())) { // Not a valid email adress
      req.session.flash = { type: 'error', text: 'Not a valid email!' }
      throw new Error()
    }
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      req.session.flash = { type: 'error', text: 'You must select reCaptcha first!' }
      throw new Error()
    }
    if (req.body['g-recaptcha-response'] === 'captchaBypass' && test === true) { // For testing
      isVerified = true
    } else {
      isVerified = await verifyRecaptcha(req.body['g-recaptcha-response'])
    }
    if (isVerified.success === false) {
      req.session.flash = { type: 'error', text: 'We think you are a spam. If you are not, try reCaptcha again. ' }
      throw new Error()
    }
    if (req.session.user) {
      req.session.destroy()
    }
    let userdb = await User.findOne({ email: req.body.email.toLowerCase() })
    if (userdb) { // Email already exists
      req.session.flash = { type: 'error', text: 'Email already exists!' }
      throw new Error()
    }
    userdb = await User.findOne({ username: req.body.username })
    if (userdb) { // User already exists
      req.session.flash = { type: 'error', text: 'Username already exists!' }
      throw new Error()
    }
    if (req.body.password !== req.body.password2) {
      req.session.flash = { type: 'error', text: 'Not matching passwords!' }
      throw new Error()
    }
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email.toLowerCase()
    })
    await user.save()
    const mailOptions = {
      from: process.env.GMAIL_ACCOUNT,
      to: process.env.GMAIL_ACCOUNT, // userEmail,
      subject: 'New registration at GoViral.com',
      text: 'The new user is ' + req.body.email,
      html: '<h1>New user</h1> <p>The new user is ' + req.body.email + '</p>'
    }
    await sendEmail(mailOptions)
    req.session.flash = { type: 'success', text: 'You are registered!' }
    res.redirect('./login')
  } catch (error) {
    res.redirect('.')
  }
}

/**
 * Displays form to login user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.login = (req, res) => {
  let loggedIn = false
  if (req.session.user) {
    loggedIn = true
  }
  const viewData = {
    loggedIn: loggedIn,
    captcha: res.recaptcha
  }
  res.render('users/login', { viewData })
}

/**
 * Displays form to recover password.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.forgot = (req, res) => {
  res.render('users/forgot')
}

/**
 * Handles recover password request.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.forgotPassword = async (req, res) => {
  req.session.flash = { type: 'error', text: 'Something went wrong!' }
  try {
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      req.session.flash = { type: 'error', text: 'You must select reCaptcha first!' }
      throw new Error()
    }
    const isVerified = await verifyRecaptcha(req.body['g-recaptcha-response'])
    if (isVerified.success === false) {
      req.session.flash = { type: 'error', text: 'We think you are a spam. If you are not, try reCaptcha again. ' }
      throw new Error()
    }
    const token = Math.floor(Math.random() * 1000000000000000)
    console.log(token)
    if (!validator.isEmail(req.body.email.toLowerCase())) { // Not a valid email adress
      req.session.flash = { type: 'error', text: 'Not a valid email!' }
      throw new Error()
    }
    const user = await User.findOne({ username: req.body.username, email: req.body.email })
    if (user) {
      const resetA = '<a href="https://goviralevents.com/users/recoverPassword/' + token + '/' + req.body.username + '">https://goviralevents.com/users/recoverPassword/' + token + '/' + req.body.username + '</a>'
      await User.updateOne({ _id: user.id }, {
        passToken: await bcrypt.hash(token.toString(), 8), // cause "update" wont pre hash when saving to db
        passDate: new Date()
      })
      const mailOptions = {
        from: process.env.GMAIL_ACCOUNT,
        to: req.body.email,
        subject: 'Recover your password',
        text: 'Follow this link to reset password ' + resetA,
        html: '<h1>Recover your password</h1> <p>Follow this link to reset password ' + resetA + '</p><p>If you did not send this mail, ignore it. </p><p>/ Go Viral Events</p>'
      }
      await sendEmail(mailOptions)
    } else {
      req.session.flash = { type: 'error', text: 'No user found!' }
      throw new Error()
    }
    req.session.flash = { type: 'success', text: 'Email sent!' }
    res.redirect('../')
  } catch (error) {
    res.redirect('../users/forgot')
  }
}

/**
 * Displays form to reset password from link.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.recoverPassword = (req, res) => {
  const viewData = {
    token: req.params.token,
    username: req.params.username
  }
  res.render('users/recover', { viewData })
}

/**
 * Resets new password.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.recoverPasswordPost = async (req, res) => {
  req.session.flash = { type: 'error', text: 'Something went wrong!' }
  try {
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      req.session.flash = { type: 'error', text: 'You must select reCaptcha first!' }
      throw new Error()
    }
    const isVerified = await verifyRecaptcha(req.body['g-recaptcha-response'])
    if (isVerified.success === false) {
      req.session.flash = { type: 'error', text: 'We think you are a spam. If you are not, try reCaptcha again. ' }
      throw new Error()
    }
    const user = await User.findOne({ username: req.body.username })
    var hours = Math.abs(new Date() - user.passDate) / 36e5

    if (await bcrypt.compare(req.body.token, user.passToken) && hours <= 2) {
      if (req.body.password !== req.body.password2) {
        req.session.flash = { type: 'error', text: 'Not matching passwords!' }
        throw new Error()
      }
      await User.updateOne({ _id: user.id }, {
        passToken: '',
        passDate: null,
        password: await bcrypt.hash(req.body.password, 8)
      })
    } else {
      req.session.flash = { type: 'error', text: 'Not valid! Try to recover password again.' }
      throw new Error()
    }
    req.session.user = undefined
    req.session.flash = { type: 'success', text: 'Password updated!' }
    res.redirect('../users/login')
  } catch (error) {
    res.redirect('../users/forgot')
  }
}

/**
 * Displays user profile.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.profile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    if (req.session.user === user.username || req.session.admin === true) {
      const viewData = {
        id: user._id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email,
        created: user.createdAt.toLocaleDateString('en-US'),
        events: (await Event.find({ owner: req.params.username }))
          .map(event => ({
            id: event._id,
            title: event.title
          }))
      }
      if (req.session.user === user.username) {
        viewData.loggedIn = true
      }
      res.render('users/profile', { viewData })
    } else {
      throw new Error()
      // console.log(await Event.find({ owner: req.params.username }))
    }
  } catch (error) {
    req.session.flash = { type: 'error', text: 'You dont have permissons' }
    res.redirect('../login')
  }
}

/**
 * Updates user profile.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.profileUpdate = async (req, res) => {
  let name
  try {
    let user
    if (req.session.admin) { // IF ADMIN
      user = await User.findOne({ _id: req.body.id })
    } else {
      user = await User.findOne({ username: req.session.user })
    }
    const editID = user._id
    name = user.username

    if (validateName(req.body.username) === true || validateName(req.body.name) === true || validateName(req.body.surname) === true) {
      if (req.body.typeofchange === 'username') { // Update username and events
        const userdb = await User.findOne({ username: req.body.name })
        if (userdb) { // User already exists
          req.session.flash = { type: 'error', text: 'Username already exists!' }
          throw new Error()
        } else {
          await Event.updateMany({ _id: editID }, { owner: req.body.name })// Update events with username
          await User.updateOne({ _id: editID }, {
            username: req.body.name
          })
          req.session.user = req.session.admin ? req.session.user : req.body.name
          name = req.body.name
        }
      } else { // update name or surname
        const user = await User.findOne({ _id: editID })
        await User.updateOne({ _id: editID }, {
          name: (req.body.typeofchange === 'name') ? req.body.name : user.name,
          surname: (req.body.typeofchange === 'surname') ? req.body.name : user.surname
        })
      }

      req.session.flash = { type: 'success', text: 'Updated!' }
      res.redirect('../profile/' + name)
    } else {
      req.session.flash = { type: 'error', text: 'Not allowed characters or empty!' }
      throw new Error()
    }
  } catch (error) {
    res.redirect('../profile/' + name)
  }
}

/**
 * Logins in user (sets session).
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.loginPost = async (req, res) => { // post
  try {
    await User.authenticate(req.body.username, req.body.password)
    req.session.user = req.body.username
    await isAdmin(req, req.session.user) // set as admin if user is
    req.session.flash = { type: 'success', text: 'Logged in successfully.' }
    res.redirect('./profile/' + req.body.username)
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Something went wrong, try again!' }
    res.redirect('./login')
  }
}

/**
 * Log out user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.logoutPost = async (req, res) => { // post
  try {
    req.session.destroy()
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Something went wrong, try again!' }
  }
  res.redirect('./login')
}

/**
 * Displays form to delete user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.delete = (req, res) => {
  const viewData = {
    username: req.params.username
  }
  res.render('users/delete', { viewData })
}

/**
 * Deletes user and its events.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.remove = async (req, res) => {
  let user
  if (req.session.admin === true || req.session.user === req.body.username) {
    if (req.session.admin) { // IF ADMIN
      user = req.body.username
    } else {
      user = req.session.user
    }
  } else {
    req.session.flash = { type: 'error', text: 'You can not delete this account.' }
    throw new Error()
  }
  try {
    await User.deleteMany({ username: user })
    await Event.deleteMany({ owner: user })
    req.session.flash = { type: 'success', text: 'Deleted successfully.' }
    req.session.user = undefined
    res.redirect('./add')
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Something went wrong.' }
    res.redirect('..')
  }
}

/**
 * Displays form to chancge password.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.change = (req, res) => {
  const viewData = {
    username: req.params.username
  }
  res.render('users/change', { viewData })
}

/**
 * Changes users password.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
usersController.changePassword = async (req, res) => {
  let user
  try {
    if (req.session.admin === true || req.session.user === req.body.username) {
      if (req.session.admin) { // IF ADMIN
        user = req.body.username
      } else {
        user = req.session.user
      }
    } else {
      req.session.flash = { type: 'error', text: 'You can not change password.' }
      throw new Error()
    }
    await User.authenticate(user, req.body.oldpassword)

    if (req.body.newpassword !== req.body.newpassword2) {
      req.session.flash = { type: 'error', text: 'Not matching passwords!' }
      throw new Error()
    }
    const newPass = await bcrypt.hash(req.body.newpassword, 8) // Because it's not updated in pre save in User.js
    await User.updateOne({ username: user }, { password: newPass })

    req.session.flash = { type: 'success', text: 'Updated successfully.' }
    res.redirect('./profile/' + user)
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Something went wrong in password.' }
    res.redirect('./profile/' + user)
  }
}

/**
 * Check if valData matches regex.
 *
 * @returns {boolean} - Validation status.
 * @param {string} valData - The data to be validated.
 */
function validateName (valData) {
  if (valData === undefined) {
    return false
  }
  // const nameRegex = /^[a-zA-Z0-9]+$/
  const nameRegex = /^[a-zA-Z0-9\- ÅåÄäÖöØøÆæÉéÈèÜüÊêÛûÎî]*$/
  return nameRegex.test(valData)
}

/**
 * Check recaptcha verification.
 *
 * @returns {boolean} - Verification status.
 * @param {string} userResponse - The token recieved when form was submitted.
 */
const verifyRecaptcha = async userResponse => {
  const verUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.CAPTCHA_SECRET_KEY_V2 + '&response=' + userResponse // + '&remoteip=' + req.connection.remoteAddress
  const response = await getJson(verUrl)
  return response
}

/**
 * Checks if admin and sets session.
 *
 * @param {object} req - Request object.
 * @param {string} username - User to get content from.
 * @returns {boolean} If user is admin.
 */
const isAdmin = async (req, username) => {
  const user = await User.findOne({ username: username })
  if (user.admin === true) {
    req.session.admin = true
    return true
  } else {
    return false
  }
}

/**
 * Fetch and get json from an URL.
 *
 * @param {string} url - URL to get content from.
 * @returns {Promise<string> } The content in json.
 */
const getJson = async url => {
  try {
    const data = await fetch(url) // Await because we need to wait for result of request
    return await data.json() // Await because we need to wait for json to parse
  } catch (error) {
    console.log(error)
  }
}

/**
 * Send confirmation email to admin.
 *
 * @returns {boolean} - Message of email status.
 * @param {object} mailOptions - Mail Options to send mail.
 */
const sendEmail = async mailOptions => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ACCOUNT,
      pass: process.env.GMAIL_PASSWORD
    }
  })

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Email not sent: ' + error)
      return false
    }
  })
  return true
}

/**
 * Checks if user is logged in.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
usersController.auth = (req, res, next) => { // Is user logged in?
  if (!req.session.user) {
    req.session.flash = { type: 'error', text: 'You must log in to use this function!' }
    res.redirect('../login')
    // return next(error)
  }
  next()
}

module.exports = usersController
module.exports.sendEmail = sendEmail // Testning
