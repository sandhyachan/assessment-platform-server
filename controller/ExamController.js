const { ExamModel } = require("../model/ExamModel");
const { UserModel } = require("../model/UserModel")
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const createExam = async (req, res) => {
    const { exam_title, exam_description, questions, dueDate, timeAllocated } = req.body

    const existingExam = await ExamModel.findOne({ exam_title })
    if (existingExam) {
      return res.status(400).json({ message: 'An exam with this title already exists.' })
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'dueDate is required.' })
    }
  
    try {
      const newExam = new ExamModel({
        exam_title,
        exam_description,
        questions,
        dueDate,
        timeAllocated
      })
  
      await newExam.save()
      res.status(201).json({ message: 'Exam created successfully', exam: newExam })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Failed to create exam.', error: error.message })
    }
  }
  

  const exams = async (req, res) => {
    try {
      const { examTitle } = req.params
  
      const exam = await ExamModel.findOne({ exam_title: examTitle })
  
      if (!exam) {
        return res.status(404).json({
          message: 'Exam not found'
        })
      }
  
      res.status(200).json({
        message: 'Exam fetched successfully',
        exam  
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: 'Failed to retrieve exams. Please try again.',
        error: error.message
      })
    }
  }

  const examsList = async (req, res) => {
    try {
      // Fetch all exams created by the teacher (adjust filtering if needed)
      const exams = await ExamModel.find()  // You can add a teacher filter here if necessary
    
      if (exams.length === 0) {
        return res.status(404).json({
          message: 'No exams found'
        })
      }
    
      res.status(200).json({
        message: 'Exams fetched successfully',
        exams
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: 'Failed to retrieve exams. Please try again.',
        error: error.message
      })
    }
  }  

  const editExam = async (req, res) => {

    const {examTitle} = req.params
    const { exam_title, exam_description, questions, timeAllocated, dueDate } =  req.body
  
    if (!exam_title || !exam_description || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields and ensure questions array is not empty.' })
    }
  
    try {
      const exam = await ExamModel.findOne({ exam_title: examTitle })
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' })
      }
  
      exam.exam_title = exam_title 
      exam.exam_description = exam_description 
      exam.questions = questions
      exam.timeAllocated = timeAllocated
      exam.dueDate = dueDate
  
      await exam.save()
  
      res.status(200).json({ message: 'Exam updated successfully', exam })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Failed to update exam.', error: error.message })
    }
  }

  const allocateStudents = async (req, res) => {
    const { examTitle } = req.params
    const { emails } = req.body
  
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of student emails.' })
    }
  
    try {
      const exam = await ExamModel.findOne({ exam_title: examTitle })
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' })
      }
  
      const updatedEmails = [...new Set([...(exam.allocated_students || []), ...emails])]
      exam.allocated_students = updatedEmails
      await exam.save()
  
      const sendEmails = emails.map((email) => {
        const msg = {
          to: email,
          from: 'honeycoupleart@gmail.com',
          subject: `You've been invited to take the exam: ${exam.exam_title}`,
          html: `
            <p>Dear Student,</p>
            <p>You have been invited to take the following exam:</p>
            <h3>${exam.exam_title}</h3>
            <p><strong>Description:</strong> ${exam.exam_description}</p>
            <p><strong>Due Date:</strong> ${new Date(exam.dueDate).toLocaleDateString()}</p>
            <p><strong>Time Allocated:</strong> ${exam.timeAllocated}</p>
            <p><strong> Access the exam here: </strong>
            </p>
            <a href="http://localhost:5173/student/exams/${encodeURIComponent(exam.exam_title)}" target="_blank">
            Start Exam
            </a>
            <br/>
            <p>Good luck!</p>
            <p>- Questra Team</p>
          `
        }
        return sgMail.send(msg)
      })
  
      await Promise.all(sendEmails)
  
      res.status(200).json({
        message: 'Students allocated and invitations sent successfully.',
        allocated_students: updatedEmails
      })
  
    } catch (error) {
      console.error('Error allocating students:', error)
      res.status(500).json({
        message: 'Failed to allocate students and send emails.',
        error: error.message
      })
    }
  }  
  
module.exports = { createExam, exams, editExam, examsList, allocateStudents }