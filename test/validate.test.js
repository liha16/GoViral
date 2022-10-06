/**
 * Test validation: validate.js.
 */

const { validateEmail, validateName, validatePasswords } = require('../public/js/validate')


test('Validates if "tester" is a valid username', () => {
  expect(validateName('tester', 'username', '50')).toBe(true)
})

test('Validates if bad username returns false', () => {
  expect(validateName('test<er', 'username', '50')).toBe(false)
})

test('Validates if passwords are matching', () => {
  expect(validatePasswords('123456789', '987654321')).toBe(false)
})

test('Validates if passwords are matching', () => {
  expect(validatePasswords('123456789', '123456789')).toBe(true)
})

test('Validates if email is correct', () => {
  expect(validateEmail('123')).toBe(false)
})

test('Validates if email is correct', () => {
  expect(validateEmail('lisa.veltman@gmail.com')).toBe(true)
})
