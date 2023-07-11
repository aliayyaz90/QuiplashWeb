const success = (res, message, data) => {
    res.status(200).json({
        status: 'success',
        message,
        data
    });
};

const bad = (res, message) => {
    res.status(400).json({
        status: 'Error',
        message
    });
};

const existError = (res,message) => {
    res.status(202).json({
        status: 'Exist',
        message
    });
};

const notFound = (res) => {
    res.status(404).json({
        status: 'Error',
        message: 'Not found!',
    });
};

const serverError = (res) => {
    res.status(202).json({
        status: 'Error',
        message: 'Internal Server Error',
    });
};


const setResponse = (res, { type, message = '', data = {} }) => {
    switch (type) {
        case 'success':
            success(res, message, data)
            break;
        case 'bad':
            bad(res, message)
            break;
        case 'notFound':
            notFound(res)
            break;
        case 'serverError':
            serverError(res)
            break;
        case 'existError':
            existError(res, message)
            break;   

        default:
            break;
    }
};

module.exports = {
    setResponse
}