/**
 * Active nav links.
 */
const element = window.location.pathname
const nav = document.getElementsByTagName('nav')[0]
const lis = nav.getElementsByTagName('li')
for (var i = 0; i < lis.length; i++) {
  if (element === lis[i].querySelector('a').getAttribute('href')) {
    lis[i].querySelector('a').classList.add('active')
  }
}

/**
 * Active page links.
 */
const page = window.location.pathname.split('\\').pop().split('/').pop()
const pages = document.querySelectorAll('.page')
if (page === 'events') {
  pages[0].classList.add('activePage')
} else {
  for (var ii = 0; ii < page; ii++) {
    if (pages[ii].textContent === page) {
      pages[ii].classList.add('activePage')
    }
  }
}
/**
 * Eventlistener when sorting by likes.
 */
if (document.getElementById('byLikes')) {
  document.getElementById('byLikes').addEventListener('click', async event => {
    event.preventDefault()
    sortDivs('val')
  })
}

/**
 * Change form to send different data depending on link clicked.
 */
if (document.getElementsByClassName('updateProfile')) {
  var editLinks = document.getElementsByClassName('updateProfile')
  for (const link of editLinks) {
    link.addEventListener('click', async event => {
      event.preventDefault()
      console.log(link.getAttribute('data-updateData'))
      document.getElementById('changeFormTitle').textContent = link.getAttribute('data-updateData') + '.'
      document.getElementById('changeData').value = link.getAttribute('data-updateData')
      toggleModal()
    })
  }
}

/**
 * Eventlistener for clicking on sorting by newest event.
 */
if (document.getElementById('byNew')) {
  document.getElementById('byNew').addEventListener('click', async event => {
    event.preventDefault()
    sortDivs('created')
  })
}

/**
 * Eventlistener to all categories.
 */
if (document.getElementById('categoriesDropdown')) {
  document.getElementById('categoriesDropdown').addEventListener('change', async event => {
    toggleEvent(document.getElementById('categoriesDropdown').value)
  })
}

/**
 * Search word.
 */
if (document.querySelector('.searchWord')) {
  document.querySelector('.searchWord').addEventListener('click', async event => {
    var events = document.getElementsByClassName('eventlink')
    var query = document.getElementById('searchWord').value.toLowerCase()
    var divs = []
    console.log(query)
    for (var i = 0; i < events.length; ++i) {
      divs.push(events[i])
      if (events[i].textContent.includes(query)) {
        events[i].style.display = 'block'
      } else {
        events[i].style.display = 'none'
      }
    }
  })
}

/**
 * A button to go back in browser history.
 */
if (document.getElementById('back')) {
  document.getElementById('back').addEventListener('click', async event => {
    window.history.back()
    return false
  })
}

/**
 * Hides form input for global events.
 */
if (document.getElementById('globalevent')) {
  document.getElementById('globalevent').addEventListener('click', function () {
    var element = document.getElementById('location')
    element.classList.toggle('hide')
  })
}

/**
 * Opens share socialmedia in new window.
 */
if (document.getElementById('facebooklink')) {
  document.getElementById('facebooklink').addEventListener('click', function () {
    var href = 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.goviralevents.com%2Fevents%2F' + this.dataset.id + '&amp;src=sdkpreparse'
    window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
    return false
  })
  document.getElementById('twitterlink').addEventListener('click', function () {
    var href = 'http://twitter.com/share?text=Check out this event: ' + this.dataset.title + '&url=https%3A%2F%2Fwww.goviralevents.com%2Fevents%2F' + this.dataset.id + '&hashtags=event,happening'
    window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
    return false
  })
}

/**
 * Sorts divs.
 *
 * @param {string} keyname - Of what data to sort the list by.
 */
function sortDivs (keyname) {
  var eventlink = document.getElementsByClassName('eventlink')
  var divs = []
  for (var i = 0; i < eventlink.length; ++i) {
    divs.push(eventlink[i])
  }
  divs.sort(function (a, b) { // sort by param
    return b.dataset[keyname].localeCompare(a.dataset.val)
  })
  document.querySelector('.eventlist').innerHTML = ''
  divs.forEach(function (div) {
    document.querySelector('.eventlist').appendChild(div)
  })
}

/**
 * Toggle events with category.
 *
 * @param {string} category - Category to be hidden/shown.
 */
function toggleEvent (category) {
  var eventlink = document.getElementsByClassName('eventlink')
  var divs = []
  for (var i = 0; i < eventlink.length; ++i) {
    divs.push(eventlink[i])
    if (category === 'all') {
      eventlink[i].style.display = 'block'
    } else if (!eventlink[i].dataset.cat.includes(category)) {
      eventlink[i].style.display = 'none'
    } else {
      eventlink[i].style.display = 'block'
    }
  }
  printButton(category)
}

/**
 * Toggle modal.
 */
function toggleModal () {
  // Get the modal
  var modal = document.getElementById('modal')

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName('close')[0]

  // Open the modal
  modal.style.display = 'block'

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = 'none'
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = 'none'
    }
  }
}

/**
 * Prints button to see all posts with category.
 *
 * @param {string} category - Category to be hidden/shown.
 */
function printButton (category) { // Prints button of choosen category
  var catButton = document.createElement('div')
  var newContent = document.createTextNode('See ' + category + ' events')
  catButton.appendChild(newContent)
  catButton.classList.add('button')
  var catLink = document.createElement('a')
  catLink.href = '/events/category/' + category
  catLink.appendChild(catButton)
  document.querySelector('.actualCategory').innerHTML = ''
  document.querySelector('.actualCategory').appendChild(catLink)
}
