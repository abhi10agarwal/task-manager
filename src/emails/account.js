const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SEND_Grid_API)
const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'abhishek10agarwal@gmail.com',
		subject: 'Welcome to Task App',
		text: `Welcome to the app, ${name},let me know how you get along the app.`
	})
}
module.exports = {
	sendWelcomeEmail
}
//
