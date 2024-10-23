const catchAsyncError = require("../middlewares/catchAsyncError");
const usersModel = require("../models/usersModel");
const ErrorHandler = require("../utils/error/errorHandler");
const cloudinary = require('cloudinary');
const sendToken = require("../utils/functions/jwtToken");
const passwordRecoveryMail = require("../utils/mails/passwordRecoveryMail");
const crypto = require('crypto');

//* register user
exports.registerUser = catchAsyncError(async (req, res, next) => {

    const { name, email, phone, password, avatar } = req.body;

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    if (!name || !email || !phone || !password) { return next(new ErrorHandler("Please Enter all fields", 400)); };

    const userExist = await usersModel.findOne({ email });
    if (userExist) { return next(new ErrorHandler("Something went wrong", 400)); };

    const user = await usersModel.create({
        name, email, phone, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    if (!user) return next(new ErrorHandler("User Not Create", 404));

    sendToken(user, res);

});

//* login user
exports.loginUser = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) return next(new ErrorHandler("Please Enter Email & Password", 404));

    const user = await usersModel.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("User Not Found", 404));

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) return next(new ErrorHandler("Invalid Email or Password", 404));

    sendToken(user, res);

});

//* logout user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
    return res.status(200).json({ success: true, message: "Logout Successfully" });
});

//* forget password
exports.forgetPassword = catchAsyncError(async (req, res, next) => {

    const user = await usersModel.findOne({ email: req.body.email });
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // const resetPasswordUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`;
    const message = `Your Password Reset Code is given below. If you have not requested this email, please ignore it.`;


    try {

        await passwordRecoveryMail({
            email: user.email,
            subject: `Amoree Scents Password Recovery`,
            message,
            resetToken,
        })
        res.status(200).json({
            success: true,
            message: `Password recovery code is sent to ${user.email} successfully`,
        });

    } catch (error) {
        console.log("🚀 ~ exports.forgetPassword=catchAsyncError ~ error:", error.message)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));

    }

});

// * reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.body.code).digest('hex');

    const user = await usersModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 404));

    if (req.body.password !== req.body.confirmPassword) return next(new ErrorHandler("Password does not match", 400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, res);

});

// * get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {

    // console.log("🚀 ~ exports.getUserDetails=catchAsyncError ~ req.user:", req.user)
    // console.log("🚀 ~ exports.getUserDetails=catchAsyncError ~ req.user.id:", req.user.id)
    // console.log("🚀 ~ exports.getUserDetails=catchAsyncError ~ req.user._id:", req.user._id)

    const user = await usersModel.findById(req.user.id);

    if (!user) return next(new ErrorHandler("User Not Found", 404));

    res.status(200).json({ success: true, user });

});

//* user password update
exports.updatePassword = catchAsyncError(async (req, res, next) => {

    const user = await usersModel.findById(req.user.id).select("+password");

    if (!req.body.oldPassword || !req.body.newPassword || !req.body.confirmPassword) return next(new ErrorHandler("Please fill all fields", 400));

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) return next(new ErrorHandler("Old Password Is Incorrect", 400));

    if (req.body.newPassword !== req.body.confirmPassword) return next(new ErrorHandler("Password does not match", 400));


    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, res);
})

//* update user profile without password
exports.updateProfile = catchAsyncError(async (req, res, next) => {


    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.body.avatar && req.body.avatar !== "" && req.body.avatar !== 'undefined') {
        const user = await usersModel.findById(req.user.id);

        const imageId = user.avatar?.public_id;
        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        };
    }

    const user = await usersModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!user) return next(new ErrorHandler(`User not found with this ${req.user.id} or not updated`, 404));

    res.status(200).json({ success: true, user });

})



//# get all users for ~~Admin
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await usersModel.find();

    res.status(200).json({
        success: true,
        users
    });
})

//# get users details for ~~Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await usersModel.findById(req.params.id);

    if (!user) return next(new ErrorHandler(`User does not exist with this ${req.params.id} Id`, 404));

    res.status(200).json({ success: true, user });
})

//# update user Profile or Role by ~~Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const updatedUser = await usersModel.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!updatedUser) return next(new ErrorHandler("User Not update or not found", 404));

    res.status(200).json({ success: true, updatedUser });

})

//# delete user by ~~Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await usersModel.findById(req.params.id);
    if (!user) return next(new ErrorHandler(`User does not exist with this ${req.params.id} Id`, 404));

    const imageId = user.avatar?.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({ success: true, message: "User deleted successfully" });

})