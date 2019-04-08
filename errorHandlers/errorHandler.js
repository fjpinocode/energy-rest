const Boom = require('boom');

const errorHandler = (err, req, res, next) => {
    resErrorBoom(err, res);
    next();
};

const resErrorBoom = (err, res) => {
    try {
        if (err && Boom.isBoom(err)) {
            res.status(err.output.statusCode).json(err);
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'dev' && (error.stack || error.message)) {
            res.status(500).json(error.stack || error.message);
        } else {
            res.status(500).json(Boom.internal().output.payload);
        }
    }
}

module.exports = {
    errorHandler
};