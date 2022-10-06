/**
 * Test suit Schema user.
 */

const mongoose = require('mongoose')
const UserModel = require('models/User.js')
const userData = {
  username: 'unittester',
  name: 'Tester',
  surname: 'Testsson',
  email: 'info@casaolive.com',
  password: 'testpassword123',
  admin: false
}

describe('User Model Test', () => {
  // It's just so easy to connect to the MongoDB Memory Server
  // By using mongoose.connect
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })
  })

  // Test that schema works and data is saved
  it('Create & save a user successfully', async () => {
    const validUser = new UserModel(userData)
    const savedUser = await validUser.save()
    expect(savedUser._id).toBeDefined()
    expect(savedUser.title).toBe(userData.title)
    expect(savedUser.city).toBe(userData.city)
  })

  


  // You shouldn't be able to add in any field that isn't defined in the schema
  it('Create a user successfully, but with undefined fields in schema', async () => {
    userData.username = 'unittester2' // Update details to not have duplicates
    userData.email += 'info2@casaolive.com' // Update details to not have duplicates
    const userInvalidField = new UserModel(userData)
    const savedInvalidField = await userInvalidField.save()
    expect(savedInvalidField._id).toBeDefined()
    expect(savedInvalidField.whatever).toBeUndefined()
  })

  // Not all required fields.
  it('create User without required field should failed', async () => {
    const userWithoutRequired = new UserModel({ name: 'Should not be saved in DB' })
    let err
    try {
      const savedUserWithoutRequired = await userWithoutRequired.save()
      error = savedUserWithoutRequired
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.email).toBeDefined()
    expect(err.errors.username).toBeDefined()
    // expect(err.errors.likes).toBeDefined()
  })

  // Update user.
  it('Update a user', async () => {
    await UserModel.updateMany({ username: 'unittester' }, { username: 'unittesterupdated' })
    const updated = await UserModel.find({ username: 'unittesterupdated' })
    expect(updated).toBeDefined()
  })

  // Delete tester user created in this test.
  it('Delete user recently added for testing', async () => {
    await UserModel.deleteMany({ username: 'unittesterupdated' })
    await UserModel.deleteMany({ username: 'unittester2' })
    const deleted = await UserModel.findOne({ username: 'unittester' })
    const deleted2 = await UserModel.findOne({ username: 'unittester2' })
    const deletedUpdated = await UserModel.findOne({ username: 'unittesterupdated' })
    expect(deleted).toBeNull()
    expect(deleted2).toBeNull()
    expect(deletedUpdated).toBeNull()
  })
})
