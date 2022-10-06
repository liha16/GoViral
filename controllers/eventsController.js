/**
 * Events Controller.
 *
 * @author Lisa Veltman
 * @version 1.0.0
 */

'use strict'

const Event = require('../models/Event')
const eventsController = {}
const fetch = require('node-fetch')
const moment = require('moment')
const options = { weekday: 'long' }

/**
 * Displays a list of events.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.index = async (req, res) => {
  const ipadress = req.headers['x-real-ip'] || req.connection.remoteAddress
  // const ipadress = '2.155.80.95' // 2.155.80.95 for Barcelona,  46.246.28.146 for sweden
  const eventsPerPage = 4
  const city = await getCity(ipadress)
  const categories = []
  const pageItems = []
  console.log(req.params.page)
  let actualPage
  if (req.params.page === undefined || req.params.page === '0') {
    actualPage = 0
  } else {
    actualPage = req.params.page - 1
  }
  try {
    const viewData = {
      clientLocation: city,
      events: (await Event.find({ }).limit(eventsPerPage).skip(eventsPerPage * actualPage))
        .map(event => ({
          id: event._id,
          title: event.title,
          categories: event.categories,
          likes: event.likes.length,
          description: event.description.substring(0, 80) + '...', // Shorter for presentation
          owner: event.owner,
          startdate: new Intl.DateTimeFormat('en-US', options).format(event.start) + ' ' + event.start.getDate() + '/' + (event.start.getMonth() + 1),
          enddate: event.end.getDate() + ' ' + (event.end.getMonth() + 1),
          starttime: event.start.toLocaleTimeString('en-US', { hour12: false }),
          endtime: event.end.toLocaleTimeString('en-US', { hour12: false }),
          created: event.createdAt
        }))

    }
    const totalPages = Math.ceil(await Event.countDocuments() / eventsPerPage)
    for (let index = 0; index < totalPages; index++) {
      pageItems.push(index + 1)
    }
    viewData.pageItems = pageItems

    viewData.events.forEach(element => { // Prepare category list
      element.categories.forEach(cat => {
        categories.indexOf(cat) === -1 ? categories.push(cat) : console.log('')
      })
    })
    viewData.categories = categories.sort()
    res.render('events/index', { viewData })
  } catch (error) {
    res.render('.')
  }
}

/**
 * Displays a list of events with same location.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.location = async (req, res) => {
  const city = req.params.location.toLowerCase()
  try {
    const viewData = {
      clientLocation: city,
      search: 'location',
      searchParam: city,
      events: (await Event.find({ city: city }))
        .map(event => ({
          id: event._id,
          title: event.title,
          description: event.description.substring(0, 80) + '...', // Shorter for presentation
          owner: event.owner,
          startdate: new Intl.DateTimeFormat('en-US', options).format(event.start) + ' ' + event.start.getDate() + '/' + (event.start.getMonth() + 1),
          enddate: event.end.getDate() + ' ' + (event.end.getMonth() + 1),
          starttime: event.start.toLocaleTimeString('en-US', { hour12: false }),
          endtime: event.end.toLocaleTimeString('en-US', { hour12: false })
          // username: req.session.user,
          // match: (req.session.user === event.author)
        }))
      // content: "tutle"
    }
    res.render('events/search', { viewData })
  } catch (error) {
    res.render('.')
  }
}

/**
 * Displays one event with ID.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.one = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id })
    const viewData = {
      description: event.description,
      shortDescription: event.description.substring(0, 80) + '...',
      title: event.title,
      id: event._id,
      address: event.address,
      mapsHref: event.address === 'global' ? '#' : 'http://maps.google.com/?q=' + event.address,
      mapsHrefTitle: event.address === 'global' ? 'Maps not available on global event' : 'Open with google maps',
      city: event.city,
      owner: event.owner,
      categories: event.categories.filter(n => n), // sort out empty categories
      likes: event.likes.length,
      startday: event.start.getDate() + '/' + (event.start.getMonth() + 1),
      startdate: new Intl.DateTimeFormat('en-US', options).format(event.start) + ' ' + event.start.getDate() + '/' + (event.start.getMonth() + 1),
      enddate: new Intl.DateTimeFormat('en-US', options).format(event.end) + ' ' + event.end.getDate() + '/' + (event.end.getMonth() + 1),
      starttime: event.start.toLocaleTimeString('en-US', { hour12: false }),
      endtime: event.end.toLocaleTimeString('en-US', { hour12: false })
    }
    if (req.session.user === event.owner || req.session.admin === true) {
      viewData.loggedIn = true
    }
    res.render('events/one', { viewData })
  } catch (error) {
    res.redirect('.')
  }
}

/**
 * Displays events with category.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.category = async (req, res) => {
  const ipadress = req.headers['x-real-ip'] || req.connection.remoteAddress
  try {
    const viewData = {
      search: 'category',
      searchParam: req.params.category,
      clientLocation: await getCity(ipadress),
      events: (await Event.find({ categories: req.params.category }))
        .map(event => ({
          id: event._id,
          title: event.title,
          description: event.description.substring(0, 80) + '...', // Shorter for presentation
          owner: event.owner,
          startdate: new Intl.DateTimeFormat('en-US', options).format(event.start) + ' ' + event.start.getDate() + '/' + (event.start.getMonth() + 1),
          enddate: event.end.getDate() + ' ' + (event.end.getMonth() + 1),
          starttime: event.start.toLocaleTimeString('en-US', { hour12: false }),
          endtime: event.end.toLocaleTimeString('en-US', { hour12: false })
        }))
    }
    res.render('events/search', { viewData })
  } catch (error) {
    res.render('.')
  }
}
/**
 * Add like to an event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.like = async (req, res) => {
  const ipadress = req.headers['x-real-ip'] || req.connection.remoteAddress
  const prevPage = req.headers.referer
  const pathPart = '/events'
  const backUrl = pathPart + prevPage.slice(prevPage.indexOf(pathPart) + pathPart.length)

  try {
    const event = await Event.findOne({ _id: req.params.id })
    const likes = event.likes

    if (likes.indexOf(ipadress) === -1) {
      likes.push(ipadress)
      req.session.flash = { type: 'success', text: 'You liked this event!' }
    } else {
      req.session.flash = { type: 'error', text: 'You can only like once!' }
    }
    await Event.updateOne({ _id: req.params.id }, {
      likes: likes
    })

    res.redirect(backUrl)

    // res.render('events')
  } catch (error) {
    res.render('.')
  }
}

/**
 * Displays a form to add event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.add = (req, res) => {
  res.render('events/add')
}

/**
 * Creates a new event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

eventsController.create = async (req, res) => { // Post
  try {
    const start = moment(req.body.startdate, 'ddd-MMM-DD-YYYY HH:mm:ss Z ZZ').toDate()
    const end = moment(req.body.enddate, 'ddd-MMM-DD-YYYY HH:mm:ss Z ZZ').toDate()

    const startDate = getFormatDate(start.getFullYear(), (start.getMonth() + 1), start.getDate(), req.body.starthour, req.body.startmin)
    const endDate = getFormatDate(end.getFullYear(), (end.getMonth() + 1), end.getDate(), req.body.endhour, req.body.endmin)

    if (req.body.cat1 === undefined) { // As it can not be set as required lenght in schema
      throw new Error()
    }
    isCategoryValid(req.body.cat1, true)
    isCategoryValid(req.body.cat2, false)
    if (endDate < startDate) {
      req.session.flash = { type: 'error', text: 'The end date must be after the start date!' }
      res.redirect(req.headers.referer)

      // HANDLE IF CHECKED MAKE GLOBAL EVEN IF CONTENT!!!
    } else {
      const event = new Event({
        title: req.body.title,
        description: req.body.description,
        owner: req.session.user,
        city: req.body.city ? req.body.city.toLowerCase() : 'global',
        address: req.body.address ? req.body.address.toLowerCase() : 'global',
        country: req.body.country ? req.body.country.toLowerCase() : 'global',
        start: startDate,
        end: endDate,
        image: req.body.image ? req.body.image.toLowerCase() : '',
        categories: [req.body.cat1.toLowerCase(), req.body.cat2 ? req.body.cat2.toLowerCase() : ''],
        likes: [],
        shares: []
      })

      await event.save()
      req.session.flash = { type: 'success', text: 'New event added!' }
      res.redirect('./' + event.id)
    }
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Could not save! ' + error.message }
    res.redirect('.')
  }
}

/**
 * Displays a form to delete an event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.remove = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id })
    if (req.session.user !== event.owner) {
      req.session.flash = { type: 'error', text: 'You dont have permissons' }
      res.redirect('..')
    } else {
      const viewData = {
        id: event._id,
        title: event.title,
        description: event.description
      }
      res.render('events/remove', { viewData })
    }
  } catch (error) {
    req.session.flash = { type: 'error', text: 'We cant find this page' }
    res.render('events')
  }
}
/**
 * Displays a form to update an event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.edit = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id })
    if (req.session.user === event.owner || req.session.admin === true) {
      const viewData = {
        id: event._id,
        title: event.title,
        description: event.description,
        startyear: event.start.getFullYear(),
        startmonth: event.start.getMonth() + 1,
        startday: event.start.getDate(),
        starthour: event.start.getHours(),
        startmin: event.start.getMinutes(),
        endyear: event.start.getFullYear(),
        endmonth: event.end.getMonth() + 1,
        endday: event.end.getDate(),
        endhour: event.end.getHours(),
        endmin: event.end.getMinutes(),
        address: event.address,
        city: event.city,
        country: event.country,
        cat1: event.categories[0],
        cat2: event.categories[1],
        image: event.image,
        checked: !!(event.city === event.address && event.address === event.country && event.address === 'global')
      }
      res.render('events/edit', { viewData })
    } else {
      req.session.flash = { type: 'error', text: 'You dont have permissons' }
      res.redirect('.')
    }
  } catch (error) {
    req.session.flash = { type: 'error', text: 'You dont have permissons' }
    res.redirect('.')
  }
}

/**
 * Deletes an event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.delete = async (req, res) => { // Post
  try {
    const event = await Event.findOne({ _id: req.params.id })
    if (req.session.user === event.owner || req.session.admin === true) {
      await Event.deleteOne({ _id: req.body.id })
      req.session.flash = { type: 'success', text: 'Deleted!' }
      res.redirect('/users/profile/' + event.owner)
    } else {
      req.session.flash = { type: 'error', text: 'You dont have permissons' }
      res.redirect('..')
    }
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Something went wrong, try again!' }
    res.redirect('.')
  }
}

/**
 * Updates an event.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
eventsController.update = async (req, res) => { // Post
  console.log(req.body)
  try {
    const startDate = getFormatDate(req.body.startyear, req.body.startmonth, req.body.startday, req.body.starthour, req.body.startmin)
    const endDate = getFormatDate(req.body.endyear, req.body.endmonth, req.body.endday, req.body.endhour, req.body.endmin)
    if (req.body.cat1 === undefined) { // As it can not be set as required lenght in schema
      throw new Error()
    }
    if (endDate < startDate) {
      req.session.flash = { type: 'error', text: 'The end date must be after the start date!' }
      res.redirect(req.headers.referer)
    } else {
      const event = await Event.findOne({ _id: req.params.id })
      if (req.session.user === event.owner || req.session.admin === true) {
        await Event.updateOne({ _id: req.body.id }, {
          title: req.body.title,
          description: req.body.description,
          city: req.body.city ? req.body.city.toLowerCase() : 'global',
          address: req.body.address ? req.body.address.toLowerCase() : 'global',
          country: req.body.country ? req.body.country.toLowerCase() : 'global',
          start: startDate,
          end: endDate,
          image: req.body.image ? req.body.image.toLowerCase() : '',
          categories: [req.body.cat1.toLowerCase(), req.body.cat2 ? req.body.cat2.toLowerCase() : '']
        })
        req.session.flash = { type: 'success', text: 'Updated!' }
        res.redirect('.')
      } else {
        req.session.flash = { type: 'error', text: 'You dont have permissons' }
        res.redirect('..')
      }
    }
  } catch (error) {
    req.session.flash = { type: 'error', text: 'Could not update.' }
    res.redirect('..')
  }
}

/**
 * Checks if user is logged in.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
eventsController.auth = (req, res, next) => { // Is user logged in?
  // res.send(req.session.user)
  if (!req.session.user) { // If no session
    // const err = new Error('Not matching')
    // err.statusCode = 403
    req.session.flash = { type: 'error', text: 'You must log in to use this function!' }
    res.redirect('../users/login')
    // return next(error)
  }
  next()
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
 * Get current city by Ip adress.
 *
 * @returns {string} IpData.city - The city of the clients by ipadress.
 * @param {number} ipadress - The IP adress of the client.
 */
const getCity = async ipadress => {
  var url = process.env.API_URL_IPSTACK + ipadress + '?access_key=' + process.env.API_KEY_IPSTACK
  const ipData = await getJson(url)
  return ipData.city
}

/**
 * Returns a date object.
 *
 * @returns {Date} - A date object. //2020-04-28T09:13:05.062+00:00.
 * @param {string} year - Year of date.
 * @param {string} month - Month of date.
 * @param {string} day - Day of date.
 * @param {string} hour - Hour of date.
 * @param {string} min - Min of date.
 */
function getFormatDate (year, month, day, hour, min) {
  if (month.toString().length === 1) {
    month = '0' + month
  }
  if (day.toString().length === 1) {
    day = '0' + day
  }
  if (hour.toString().length === 1) {
    hour = '0' + hour
  }
  if (min.toString().length === 1) {
    min = '0' + min
  }
  return year + '-' + month + '-' + day + 'T' + hour + ':' + min
}

/**
 * Validates if categories are valid.
 *
 * @param {object} valData - Data to validate.
 * @param {boolean} must - If required field.
 */
function isCategoryValid (valData, must) { // Prints button of choosen category
  console.log(valData)
  if (valData === undefined && must === false) {
  } else {
    var cats = ['applause', 'politics', 'donation', 'free', 'informative', 'spiritual', 'party']
    if (!cats.includes(valData.toLowerCase())) {
      throw new Error()
    }
  }
}

module.exports = eventsController
module.exports.getCity = getCity // Testning
