const { UserModel } = require("../model/UserModel")
const bcrypt = require('bcryptjs')
const { generateJwtToken } = require("../utils/JwtToken")
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const generateOtp = () => {
    const otp = crypto.randomInt(10000, 99999)
    return otp.toString()
}

const userRegistration = async (req, res) => {
    try {
        const { username, email, firstName, surname, phoneNumber, accountType, password } = req.body

        if( !username || !email || !firstName || !surname || !accountType || !password ){
            return res.status(400).json("Please enter all the required fields.")
        }
        
        if ( password.length < 8 ){
            return res.status(400).json("Password must more have atleast 8 characters. ")
        }

        const existingUser = await UserModel.findOne({username})
        if ( existingUser ){
            return res.status(409).json({
                message: "Account already exists. Please log in to your account."
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
    
        const newUser = new UserModel({
            username,
            firstName,
            surname,
            phoneNumber,
            email,
            password: hashedPassword,
            accountType
        })
        await newUser.save()
        return res.status(201).json({
            message: "Account created successfully. Please login.",
            data: newUser
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
    
}

const userLogin = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json("Please enter the login details.")
    }
    const matchingUser = await UserModel.findOne({username})
    if (!matchingUser){
        return res.status(404).json("Username does not exist.")
    }

    const passwordMatch = await bcrypt.compare(password, matchingUser.password)
    if (!passwordMatch) {
        return res.status(400).json({
            message: "Bad Credentials: Incorrect password."
        })
    }

    const token = generateJwtToken({
        username: matchingUser.username,
        email: matchingUser.email,
        accountType: matchingUser.accountType
    })
    
    return res.status(200).json({
            message: "Login Successful!",
            success: true,
            token: token,
            accountType: matchingUser.accountType
        })
}


module.exports = { userLogin, userRegistration, forgotPassword, updateUser, updatePassword }