const { questionService } = require('../services');

const getQuestions = async (req, res) => {
    try {
        const data = await questionService.getQuestions(req);
        res.send(data);
    } catch (error) {
        console.log(error)
        res.send(error);
    }
};

const addQuestion = async (req, res) => {
    try {
        const data = await questionService.addQuestion(req);
        res.send(data);
    } catch (error) {
        console.log(error)
        res.send(error);
    }
};

module.exports = {
    addQuestion,
    getQuestions
};