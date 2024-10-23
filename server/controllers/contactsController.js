const catchAsyncError = require("../middlewares/catchAsyncError");
const contactsModel = require("../models/contactsModel");
const ErrorHandler = require("../utils/error/errorHandler");
const contactMail = require("../utils/mails/contactMail");

//* create new contact
exports.contact = catchAsyncError(async (req, res, next) => {
    const { name, email, query, message } = req.body;

    if (!name || !email || !query) return next(new ErrorHandler("Please Enter name, email, & query", 400));

    const contact = await contactsModel.create({ name, email, query, message });
    if (!contact) return next(new ErrorHandler("Contact Not Created", 404));

    try {

        await contactMail({ name, email, query, message });

        res.status(200).json({
            success: true,
            message: `Email sent successfully to our team! & check your mail`,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

    res.status(201).json({ success: true, contact });
});


//# get all contacts for ~~Admin
exports.getAllContacts = catchAsyncError(async (req, res, next) => {
    const contacts = await contactsModel.find();

    res.status(200).json({
        success: true,
        contacts
    });
})

//# get contact details for ~~Admin
exports.getSingleContact = catchAsyncError(async (req, res, next) => {
    const contact = await contactsModel.findById(req.params.id);

    if (!contact) return next(new ErrorHandler(`Contact does not exist with this ${req.params.id} Id`, 404));

    res.status(200).json({ success: true, contact });
})

//# delete contact by ~~Admin
exports.deleteContact = catchAsyncError(async (req, res, next) => {

    const contact = await contactsModel.findById(req.params.id);
    if (!contact) return next(new ErrorHandler(`Contact does not exist with this ${req.params.id} Id`, 404));

    // % cloudinary

    await contact.deleteOne();

    res.status(200).json({ success: true, message: "Contact deleted successfully" });

})