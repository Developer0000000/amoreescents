const mongoose = require('mongoose');

exports.connectDB = () => {
    mongoose.connect(process.env.MONGODB_URI).then((data) => {
        console.log(`MongoDB Connected: ${data.connection.host}`);
    }) 
}