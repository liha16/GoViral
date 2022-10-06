let errormsg = 'Something went wrong'

/**
 * Validates register form.
 *
 * @returns {boolean} If passed the test or not.
 */
function validateRegisterForm () { // Prints button of choosen category
  try {
    const validUsername = validateName(document.forms.adduser.username.value, 'username', 50)
    const validName = validateName(document.forms.adduser.name.value, 'name', 100)
    const validSurname = validateName(document.forms.adduser.surname.value, 'surname', 100)
    const validPass = validatePasswords(document.forms.adduser.password.value, document.forms.adduser.password2.value)
    const validEmail = validateEmail(document.forms.adduser.email.value, 200)
    if (validUsername === false || validName === false || validSurname === false || validPass === false || validEmail === false) {
      throw new Error('Not valid')
    }
    validateGrecaptcha()
  } catch (error) {
    window.alert(errormsg)
    return false
  }
}

/**
 * Validates update form.
 *
 * @returns {boolean} If passed the test or not.
 */
function validateUpdateForm () { // Prints button of choosen category
  try {
    const maxval = document.getElementById('changeData').value === 'username' ? 50 : 100
    const validUpdateUser = validateName(document.forms.updateuser.name.value, document.getElementById('changeData').value, maxval)
    if (validUpdateUser === false) {
      throw new Error('Not valid')
    }
  } catch (error) {
    window.alert(errormsg)
    return false
  }
}

/**
 * Validates forgot password form.
 *
 * @returns {boolean} If passed the test or not.
 */
function validateForgotPassword () { // Prints button of choosen category
  try {
    const validUsername = validateName(document.forms.forgotPassword.username.value, 'username', 50)
    const validEmail = validateEmail(document.forms.forgotPassword.email.value, 200)
    if (validUsername === false || validEmail === false) {
      throw new Error('Not valid username')
    }
    validateGrecaptcha()
  } catch (error) {
    window.alert(errormsg)
    return false
  }
}

/**
 * Validates recover password form.
 *
 * @returns {boolean} If passed the test or not.
 */
function validateRecoverPassword () { // Prints button of choosen category
  try {
    validateGrecaptcha()
    const validPass = validatePasswords(document.forms.recoverPassword.password.value, document.forms.recoverPassword.password2.value)
    if (validPass === false) {
      throw new Error('Not matching passwords')
    }
  } catch (error) {
    window.alert(errormsg)
    return false
  }
}

/**
 * Checks if passwords match.
 *
 * @param {string} pass1 - One of the passwords.
 * @param {string} pass2 - The other opassword.
 * @returns {boolean} If passed the test or not.
 */
function validatePasswords (pass1, pass2) { // Prints button of choosen category
  if (pass1 !== pass2) {
    errormsg = 'The passwords are not matching!'
    // throw new Error()
    return false
  }
  return true
}

/**
 * Validates update form.
 *
 * @returns {boolean} If passed the test or not.
 */
function validateCreateEventForm () { // Prints button of choosen category
  try {
    // end date and start date
    const end = document.querySelector('#enddate').value
    const start = document.querySelector('#startdate').value

    if (!end || !start) {
      errormsg = 'You must select start and end date'
      throw new Error()
    }
    const startD = new Date(start)
    const endD = new Date(end)

    const startDate = new Date(getFormatDate(startD.getFullYear(), startD.getMonth(), startD.getDate(), document.forms.eventForm.starthour.value, document.forms.eventForm.startmin.value))
    const endDate = new Date(getFormatDate(endD.getFullYear(), endD.getMonth(), endD.getDate(), document.forms.eventForm.endhour.value, document.forms.eventForm.endmin.value))

    if (startDate > endDate) {
      errormsg = 'End time can not be before start time'
      throw new Error()
    }

    return true
  } catch (error) {
    window.alert(errormsg)
    return false
  }
}

/**
 * Validates update form.
 *
 * @returns {boolean} If passed the test or not.
 */
function validateUpdateEventForm () { // Prints button of choosen category
  try {
    // end date and start dae
    const start = getFormatDate(document.forms.updateEvent.startyear.value, document.forms.updateEvent.startmonth.value, document.forms.updateEvent.startday.value, document.forms.updateEvent.starthour.value, document.forms.updateEvent.startmin.value)
    const startDate = new Date(start)

    const end = getFormatDate(document.forms.updateEvent.endyear.value, document.forms.updateEvent.endmonth.value, document.forms.updateEvent.endday.value, document.forms.updateEvent.endhour.value, document.forms.updateEvent.endmin.value)
    const endDate = new Date(end)

    if (startDate > endDate) {
      errormsg = 'End time can not be before start time'
      throw new Error()
    }
  } catch (error) {
    window.alert(errormsg)
    return false
  }
}

/**
 * Returns a date object.
 *
 * @returns {string} - A date string. //2020-04-28T09:13:05.062+00:00.
 * @param {number} year  - Year.
 * @param {number} month - Month.
 * @param {number} day - Day.
 * @param {number} hour - Hour.
 * @param {number} min - Min.
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
 * Validates recatptcha in form.
 *
 */
function validateGrecaptcha () { // Prints button of choosen category
  var response = grecaptcha.getResponse()
  if (response.length === 0) {
    // reCaptcha not verified
    errormsg = 'Please verify you are human by checking reCaptcha!'
    throw new Error()
  }
}

/**
 * Validates email.
 *
 * @param {string} valData - Data to validate.
 * @param {number} max - Max length.
 * @returns {boolean} - If validated.
 */
function validateEmail (valData, max) {
  validateMaxLength(valData, 'email', max)
  const nameRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (nameRegex.test(valData) === false) {
    errormsg = valData + ' is not a valid email'
    return false
  }
  return true
}

/**
 * Validates lenghth of data.
 *
 * @param {string} valData - Data to validate.
 * @param {string} name - Name of data.
 * @param {number} max - Max length.
 */
function validateMaxLength (valData, name, max) {
  if (valData.length > max) {
    errormsg = name + ' is too long'
    throw new Error()
  }
}

/**
 * Validates name.
 *
 * @param {string} valData - Data to validate.
 * @param {string} name - Name of data.
 * @param {number} max - Max length.
 * @returns {boolean} - If validated.
 */
function validateName (valData, name, max) {
  validateMaxLength(valData, name, max)
  const nameRegex = /^[a-zA-Z0-9\- ÅåÄäÖöØøÆæÉéÈèÜüÊêÛûÎî]*$/
  if (nameRegex.test(valData) === false) {
    errormsg = valData + ' is not a valid ' + name
    return false
  }
  return true
}

module.exports.validateName = validateName
module.exports.validatePasswords = validatePasswords
module.exports.validateEmail = validateEmail
