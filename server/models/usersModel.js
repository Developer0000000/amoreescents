// user model

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please Enter Your Name'],
        maxLength: [30, 'Name cannot exceed 30 characters'],
        minLength: [3, 'Name should have more than 3 characters']
    },

    email: {
        type: String,
        required: [true, 'Please Enter Your Email'],
        unique: true,
        validate: [validator.isEmail, 'Please Enter a valid Email'],
    },

    phone: {
        type: Number,
        required: [true, 'Please Enter Your Phone Number'],
        minLength: [11, 'Phone number should be 11 characters'],
        maxLength: [11, 'Phone number should be 11 characters'],
        unique: true
    },

    password: {
        type: String,
        required: [true, 'Please Enter Your Password'],
        minLength: [8, 'Password should be greater than 8 characters'],
        select: false
    },

    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },

    role: {
        type: String,
        default: 'user'
    },

    products: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }
    ],

    resetPasswordToken: String,

    resetPasswordExpire: Date

}, { timestamps: true });

// * password encryption

userSchema.pre('save', async function (next) {

    try {

        if (!this.isModified('password')) {
            next();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();

    } catch (error) {
        console.log("🚀 ~ userSchema.pre ~ error:", error)
    }

});

userSchema.methods.comparePassword = async function (password) {
    try {
        return bcrypt.compare(password, this.password);
    } catch (error) {
        console.log("🚀 ~ error:", error)
    }
};

// * generate JWT token
userSchema.methods.generateToken = function () {

    try {

        return jwt.sign(
            { id: this._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

    } catch (error) {
        console.log("🚀 ~ error:", error)
    }

};


userSchema.methods.getResetPasswordToken = function () {

    //* Generating Reset Token (6 digit number)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    //* Hashing and add to userSchema
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;

};



module.exports = mongoose.model('User', userSchema);