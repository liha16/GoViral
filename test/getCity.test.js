const { getCity } = require('../controllers/eventsController')

// https://www.robinwieruch.de/node-js-jest
// https://jestjs.io/docs/en/mongodb

test('Checks if Spanish ip adress search works', () => {
  return getCity('2.155.80.95').then(data => {
    expect(data).toBe('Barcelona')
    })
})


test('Checks if Chilean ip adress search works', () => {
  return getCity('190.105.239.108').then(data => {
    expect(data).toBe('San Carlos')
    })
  })

test('Checks if Italian ip adress search works', () => {
  return getCity('95.141.37.46').then(data => {
    expect(data).toBe('Piacenza')
  })
})
