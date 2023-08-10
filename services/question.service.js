
const { Question } = require("../models");
const Constants = require('../utils/constants');

const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        console.log(questions,'111111111111')
        if (questions) {
            return {
                code: 'success',
                message: Constants.QUESTION_GET_SUCCESSFULLY,
                questions: questions
            };
        }
    } catch (error) {
        console.log(error,'6666666666')
        // res.send(error);
    }
};

const addQuestion = async (req, res) => {
    try {
        const {body} = req;
        const question = await Question.create(body);
        // console.log(question,'2222222222')
        if (question) {
            return {
                code: 'success',
                message: Constants.QUESTION_ADDED_SUCCESSFULLY,
                question: question
            };
        }

    } catch (error) {
        // res.send(error);
        console.log(error,'555555')

    }
};

module.exports = {
    addQuestion,
    getQuestions
};