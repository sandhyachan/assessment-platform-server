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

const updateUser = async (req, res) => {
    const { username } = req.user
    const { firstName, lastName, email, phoneNumber} = req.body
    
    try {
        if (!firstName || !lastName || !email || !phoneNumber) {
            return res.status(400).json({
                message: "All fields are required."
            })
        }
    
        const matchingUser = await UserModel.findOne({ username })
    
        if (!matchingUser) {
            return res.status(404).json({
                message: "User not found. Please log in."
            });
        }
        
        matchingUser.firstName = firstName;
        matchingUser.lastName = lastName;
        matchingUser.email = email;
        matchingUser.phoneNumber = phoneNumber;
    
        // Save the updated user to the database
        await matchingUser.save();
    
        // Return success res
        return res.status(200).json({
            message: "User information updated successfully.",
            data: matchingUser
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong.",
            error: error.message
        })
    }
}

const updatePassword = async ( req, res ) => {
    const {username} = req.user
    const { currentPassword, newPassword} = req.body

    try {
        const matchingUser = await UserModel.findOne({username})

        if (!matchingUser) {
            return res.status(404).json({
                message: "User not found. Please log in."
            })
        }

        const passwordMatches = await bcrypt.compare(currentPassword, matchingUser.password)
    
        if ( !passwordMatches ){
            return res.status(400).json({
                message: "Your current password is incorrect. Please enter the correct password or use the reset password option."
            })
        }
        if ( newPassword.length < 8 ){
            return res.status(400).json("New password must be at least 8 characters long. ")
        }
        
        const hashedPassword = await bcrypt.hash(newPassword,10)
        matchingUser.password = hashedPassword
        await matchingUser.save()
    
        return res.status(200).json({
            message: "Password updated successfully."
        })
    } catch (error) {
        console.error(error);  // Log the error for debugging
        return res.status(500).json({
            message: "An error occurred while updating the password. Please try again later."
        })
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const matchingUser = await UserModel.findOne({email})
        if(!matchingUser){
            return res.status(404).json({ message: 'Account not found!' })
        }
    
        const OTP = generateOtp()
        const resetLink = `https://localhost:3000/reset-password`
    
        matchingUser.passwordOtp = OTP
        await matchingUser.save()
    
        const message = {
            to: email,
            from: 'honeycoupleart@gmail.com',
            subject: 'Password Reset Request',
            text: 'Click the link below to reset your password (this link will expire in 1 hour):\n\n${resetLink}. Copy your reset OTP from here for verification. ${OTP}',
            html: `
            <p>Click the link below to reset your password (this link will expire in 1 hour):</p>
            <a href="${resetLink}">Reset Password</a>
            <p>Copy your reset OTP from here for verification.</p>
            <h6>${OTP}</h6>`
        }
    
        await sgMail.send(message)
        return res.status(200).json({ 
            message: 'Password reset email sent!',
            data: message})
    } catch (error) {
        console.error('Error sending email:', error.res ? error.res.body : error.message)
        return res.status(500).json({
            message: 'Failed to send reset email. Please try again later.',
            error: error.res ? error.res.body : error.message,
        })
    }
}

module.exports = { userLogin, userRegistration, forgotPassword, updateUser, updatePassword }