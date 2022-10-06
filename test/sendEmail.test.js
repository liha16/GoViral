const { sendEmail } = require('../controllers/usersController')

let mailOptions = {
    from: process.env.GMAIL_ACCOUNT,
    to: process.env.GMAIL_ACCOUNT, // 'lisa.veltman@gmail.com'
    subject: 'Testing sendEmail',
    text: 'Some test text',
    html: '<h1>Testing</h1> <p>Testing Email functionality in sendEmail.test.js</p>'
  }


test('Sends email to adress above: Will always succeed. Check email!', async () => {
    const dataTest = await sendEmail(mailOptions)
    expect(dataTest).toBe(true)
})

// test.skip('Checks if email is sent', async () => {
