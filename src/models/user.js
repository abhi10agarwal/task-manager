const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email not valid')
				}
			}
		},
		age: {
			type: Number,
			validate(value) {
				if (value < 0) {
					throw new Error('Age should be positive number')
				}
			},
			default: 0
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 7,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error('password connot contain "password" ')
				}
			}
		},
		tokens: [
			{
				token: {
					type: String,
					required: true
				}
			}
		],
		avator: {
			type: Buffer
		}
	},
	{
		timestamps: true
	}
)

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
	const user = this
	const userObject = user.toObject()

	delete userObject.password
	delete userObject.tokens
	delete userObject.avator
	return userObject
}
//generate token
userSchema.methods.generateAuthToken = async function () {
	const user = this
	const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET_KEY, {
		expiresIn: '7 days'
	})
	user.tokens = user.tokens.concat({ token })
	await user.save()
	return token
}

//checking credential
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email })

	if (!user) {
		throw new Error('Unable to login')
	}

	const isMatch = await bcrypt.compare(password, user.password)

	if (!isMatch) {
		throw new Error('Unable to login')
	}
	return user
}

//hasing password
userSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})

//Removing task
userSchema.pre('remove', async function (next) {
	const user = this
	await Task.deleteMany({ owner: user._id })
	next()
})
const User = mongoose.model('User', userSchema)

module.exports = User
