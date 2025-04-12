const express = require('express')
const cors = require('cors')
const { connectDB } = require('./dbConfig')
const { userLogin, userRegistration, updateUser, updatePassword, forgotPassword } = require('./controller/AuthController')
const { UserModel } = require('./model/UserModel')
const { verifyToken } = require('./middleware/verifyToken')
const { createExam, exams, editExam, examsList, allocateStudents } = require('./controller/ExamController')
const server = express()
const PORT = 3000

connectDB()
server.use(express.json())
server.use(cors())

server.post('/login', userLogin)

server.post('/registration', userRegistration)

server.post('/update-user', verifyToken, updateUser)

server.post('/update-password', verifyToken, updatePassword)

server.post('/forgot-password', forgotPassword)

server.post('/create-exam', createExam)

server.put('/exams/:examTitle', editExam)

server.get('/exams/:examTitle', exams)

server.get('/exam-lists', examsList)

server.post('/exams/allocate/:examTitle', allocateStudents)

server.get('/', async (req, res) => {
    try {
        const result = await UserModel.find()
        res.status(200).json({
            message: "Registered users fetched successfully",
            data: result
        })
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong",
            error: error.message,
        })
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})