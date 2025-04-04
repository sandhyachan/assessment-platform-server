const { ExamModel } = require("../model/ExamModel")

const createExam = async (req, res) => {
    const { exam_title, exam_description, questions, dueDate, timeAllocated } = req.body

    const existingExam = await ExamModel.findOne({ exam_title })
    if (existingExam) {
      return res.status(400).json({ message: 'An exam with this title already exists.' })
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'dueDate is required.' });
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
      const exams = await ExamModel.find();  // You can add a teacher filter here if necessary
    
      if (exams.length === 0) {
        return res.status(404).json({
          message: 'No exams found'
        });
      }
    
      res.status(200).json({
        message: 'Exams fetched successfully',
        exams
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Failed to retrieve exams. Please try again.',
        error: error.message
      });
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

module.exports = { createExam, exams, editExam, examsList }