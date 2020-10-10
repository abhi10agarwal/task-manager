const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/account')
const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
			return cb(new Error('Please upload image'))
		}
		cb(undefined, true)
	}
})

router.post(
	'/users/me/avator',
	auth,
	upload.single('avator'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer()
		req.user.avator = buffer
		await req.user.save()
		//sendWelcomeEmail(user.email, user.name)
		res.send()
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message })
	}
)

router.delete('/users/me/avator', auth, async (req, res) => {
	req.user.avator = undefined
	await req.user.save()
	res.send()
})

router.get('/users/:id/avator', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user || !user.avator) {
			throw new Error()
		}
		res.set('Content-Type', 'image/png')
		res.send(user.avator)
	} catch (e) {
		res.status(404).send()
	}
})

router.post('/users', async (req, res) => {
	const user = new User(req.body)
	try {
		await user.save()
		const token = await user.generateAuthToken()
		res.status(201).send({ user, token })
	} catch (e) {
		res.status(400).send(e.message)
	}
})
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({ user, token })
	} catch (e) {
		res.status(400).send(e.message)
	}
})

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user)
})
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => {
			return token.token != req.token
		})
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send(e.message)
	}
})
router.post('/users/logoutall', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send(e.message)
	}
})

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const availabledockeys = ['name', 'email', 'age', 'password']
	const validates = updates.every(update => availabledockeys.includes(update))
	if (!validates) {
		return res.status(404).send({ error: 'Invalid updates!' })
	}
	const _id = req.user._id
	try {
		updates.forEach(update => {
			req.user[update] = req.body[update]
		})
		await req.user.save()
		res.send(req.user)
	} catch (e) {
		res.status(500).send(e.message)
	}
})

router.delete('/users/me', auth, async (req, res) => {
	const _id = req.user._id
	try {
		await req.user.remove()
		res.send(req.user)
	} catch (e) {
		res.status(500).send(e)
	}
})

module.exports = router
