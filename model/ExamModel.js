const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: { 
        type: [String], 
        required: function() { 
            return this.questionType === 'multiple-choice' 
        }
    },
    correctAnswer: {
        type: String,
        required: false
    },
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    }
})

const ExamSchema = mongoose.Schema({
    exam_title: {
        type: String,
        required: true
    },
    exam_description: {
        type: String,
        required: true
    },
    questions: [
        questionSchema
    ],
    timeAllocated: {
        type: Number,  // Store time in minutes (Number type)
        required: true,  // Make sure time is provided when creating the exam
    },
    dueDate: {
        type: Date,  // Store due date as a Date object
        required: true,  // Make sure the due date is provided
      },
    created_at: {
        type: Date,
        default: Date.now
    }
})

 const ExamModel = mongoose.model('exam', ExamSchema)

 module.exports = { ExamModel }