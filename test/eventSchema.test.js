/**
 * Test suit Schema event.
 */

const mongoose = require('mongoose')
const EventModel = require('models/Event.js')
const eventData = {
  title: 'A test created this event',
  description: 'Lorem ipsum dolor sit amet, an mel quem wisi malis, et eros veniam sea, ea ius sonet aeterno. Vitae salutatus vis ea. Qui an commodo quaeque dissentias, placerat comprehensam duo cu, vix unum munere accusam at. Qui an audiam incorrupte, utinam veritus mea ne. Pro brute reformidans deterruisset te, vide congue tincidunt ius te. Has et putant latine reprimique.',
  owner: 'tester',
  city: 'Barcelona',
  address: 'global',
  country: 'global',
  start: '2020-10-01T08:00:00.000+00:00',
  end: '2020-10-01T08:00:00.000+00:00',
  image: 'No image',
  categories: ['demostration', 'free'],
  likes: [],
  shares: []
}

describe('Event Model Test', () => {
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
  it('Create & save an event successfully', async () => {
    const validEvent = new EventModel(eventData)
    const savedEvent = await validEvent.save()
    expect(savedEvent._id).toBeDefined()
    expect(savedEvent.title).toBe(eventData.title)
    expect(savedEvent.city).toBe(eventData.city)
  })

  // You shouldn't be able to add in any field that isn't defined in the schema
  it('Create an event successfully, but with undefined fields in schema', async () => {
    const eventInvalidField = new EventModel(eventData)
    const savedInvalidField = await eventInvalidField.save()
    expect(savedInvalidField._id).toBeDefined()
    expect(savedInvalidField.whatever).toBeUndefined()
  })

  // Not all required fields.
  it('create Event without required field should failed', async () => {
    const userWithoutRequired = new EventModel({ title: 'Should not be saved in DB' })
    let err
    try {
      const savedUserWithoutRequired = await userWithoutRequired.save()
      error = savedUserWithoutRequired
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.start).toBeDefined()
    expect(err.errors.description).toBeDefined()
    // expect(err.errors.likes).toBeDefined()
  })

  // Update post.
  it('Update a post', async () => {
    await EventModel.updateMany({ owner: 'tester' }, { owner: 'testerUpdated' })
    const updated = await EventModel.find({ owner: 'testerUpdated' })
    expect(updated).toBeDefined()
  })

  // Delete tester posts created in this test.
  it('Delete event recently added for testing', async () => {
    await EventModel.deleteMany({ owner: 'testerUpdated' })
    const deleted = await EventModel.findOne({ owner: 'tester' })
    const deletedUpdated = await EventModel.findOne({ owner: 'testerUpdated' })
    expect(deleted).toBeNull()
    expect(deletedUpdated).toBeNull()
  })
})
