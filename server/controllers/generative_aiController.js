const fs = require("fs");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/error/errorHandler");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generativeAi = catchAsyncError(async (req, res, next) => {
    
    const prompt = req.body.prompt;

    if (prompt) return next(new ErrorHandler("Please Enter Prompt", 400));

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const image = {
        inlineData: {
            data: Buffer.from(fs.readFileSync("cookie.png")).toString("base64"),
            mimeType: "image/png",
        },
    };

    const input = [prompt, image]; // Both prompt and image passed together

    // Get the result from the AI model
    const result = await model.generateContent(input);

    // If no result found, throw an error
    if (!result) return next(new ErrorHandler("Result Not Found", 404));

    // Send the result back to the client
    res.status(200).json({
        success: true,
        answer: result.response.text(), // AI's text response
        image: image.inlineData.data, // Image that was passed to the model
    });
});








// const fs = require("fs");
// const path = require("path");
// const catchAsyncError = require("../middlewares/catchAsyncError");
// const ErrorHandler = require("../utils/error/errorHandler");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// exports.generativeAi = catchAsyncError(async (req, res, next) => {

//     if (!req.body.prompt) {
//         return next(new ErrorHandler("Please enter prompt", 400));
//     }

//     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Get the uploaded image from the request
//     const uploadedImage = req.files.image; // Assuming 'image' is the form data key
//     const imageData = {
//         inlineData: {
//             data: uploadedImage.data.toString("base64"),
//             mimeType: uploadedImage.mimetype,
//         },
//     };

//     // Combine prompt and image into the input for the model
//     const input = [req.body.prompt, imageData];

//     // Send input to the AI model and generate new content
//     const result = await model.generateContent(input);

//     if (!result) return next(new ErrorHandler("Result Not Found", 404));

//     // Send back generated text and new image (same image here as example)
//     res.status(200).json({
//         success: true,
//         answer: result.response.text(),
//         generatedImage: imageData, // Send the same image or generated one
//     });
// });
