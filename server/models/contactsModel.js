const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your Name'],
        maxLength: [30, 'Name cannot exceed 30 characters'],
        minLength: [3, 'Name should have more than 3 characters']
    },

    email: {
        type: String,
        required: [true, 'Please Enter Your Email'],
        validate: [validator.isEmail, 'Please Enter a valid Email'],
    },
    query: {
        type: String,
        required: true,
        minLength: [5, 'Query should have more than 5 characters'],
        maxLength: [1000, 'Query cannot exceed 1000 characters'],
    },
    message: {
        type: String,
        maxLength: [5000, 'Message cannot exceed 5000 characters'],
    },
}, { timestamps: true });


module.exports = mongoose.model('Contact', contactSchema);
