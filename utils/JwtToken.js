const jwtToken = require('jsonwebtoken')
require('dotenv').config()

const generateJwtToken = (payload={}) => {
    const token = jwtToken.sign(payload, process.env.JWT_SECRET , {expiresIn: '10h'})
    return token
}

module.exports = {
    generateJwtToken
}