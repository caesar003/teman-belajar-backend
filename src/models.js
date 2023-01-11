"use strict";
const { v4: uuid } = require("uudi");

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: { type: String, default: uuid() },
    name: String,
    email: { type: String, unique: true },
    phone: String,
    hash: String,
});

const lessonSchema = new mongoose.Schema({
    id: { type: String, default: uuid() },
    name: String,
});

const questionSchema = new mongoose.Schema({
    id: { type: String, default: uuid() },
    question: String,
    lessonId: String,
    questionType: String,
    answer: String,
    choices: [String],
});

const testSchema = new mongoose.Schema({
    id: { type: String, default: uuid() },
    userId: String,
    questionId: String,
    answer: String,
    isCorrect: Boolean,
});

const userModel = new mongoose.model("User", userSchema);
const lessonModel = new mongoose.model("Lesson", lessonSchema);
const questionModel = new mongoose.model("Question", questionSchema);
const testModel = new mongoose.model("Test", testSchema);

module.exports = { userModel, lessonModel, questionModel, testModel };
