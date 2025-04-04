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

module.exports = { createExam, exams, editExam, examsList }