const ErrorHandler = require("../utils/error/errorHandler");

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // # Wrong MongoDB id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // # Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    //# Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Your Token is invalid. Try again`;
        err = new ErrorHandler(message, 400);
    }

    //# JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        const message = `Your Token has been Expired. Login again`;
        err = new ErrorHandler(message, 400);
    }


    res.status(err.statusCode).json({
        success: false,
        status: err.statusCode,
        message: err.message
    });

}