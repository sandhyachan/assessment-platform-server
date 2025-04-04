const mongoose  = require("mongoose");

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['proctor', 'student'] 
    },
    passwordOtp: {
        type: String,
        required: false,
        unique: true
    },
    tokenExpiration: {
        type: Date, 
        required: false 
    }
}, { timestamps: true })

const UserModel = mongoose.model('users', UserSchema)

module.exports = { UserModel }