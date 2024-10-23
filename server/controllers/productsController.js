const productsModel = require("../models/productsModel");
const ErrorHandler = require("../utils/error/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ApiFeatures = require("../utils/Features/apiFeatures");
const cloudinary = require("cloudinary");



//* Get All Products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 6;
    const productsCount = await productsModel.countDocuments();

    const apiFeatures = new ApiFeatures(productsModel.find(), req.query).search().filter()

    let products = await apiFeatures.query;
    let filteredProductsCount = products.length;

    apiFeatures.pagination(resultPerPage);
    products = await apiFeatures.query.clone();


    if (!products) return next(new ErrorHandler("Products Not Found", 404));

    return res.status(200).json({
        success: true, products, filteredProductsCount, resultPerPage, productsCount
    })


})

//* Get Products Details
exports.getProductsDetails = catchAsyncError(async (req, res, next) => {

    const productDetails = await productsModel.findById(req.params.id);
    if (!productDetails) return next(new ErrorHandler("Product Details Not Found", 404));

    return res.status(200).json({
        success: true,
        productDetails
    });

});


//* create New Review or update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        userImg: req.user.avatar?.url,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await productsModel.findById(productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));


    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

    if (isReviewed) {

        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                (rev.rating = rating), (rev.comment = comment), (rev.userImg = req.user.avatar?.url);
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach(rev => avg += rev.rating)
    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true });

})

//* Get All Reviews of a product
exports.getProductReviews = catchAsyncError(
    async (req, res, next) => {
        const product = await productsModel.findById(req.query.id);
        if (!product) return next(new ErrorHandler("Product Not Found", 404));
        return res.status(200).json({ success: true, reviews: product.reviews });
    }
);

//* Delete Review
exports.deleteReview = catchAsyncError(
    async (req, res, next) => {


        const product = await productsModel.findById(req.query.productId);
        if (!product) return next(new ErrorHandler("Product Not Found", 404));
        const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

        let avg = 0;
        reviews.forEach(rev => avg += rev.rating);

        let ratings = 0;

        if (reviews.length === 0) {
            ratings = 0;
        } else {
            ratings = avg / reviews.length;
        }

        const numOfReviews = reviews.length;

        await productsModel.findByIdAndUpdate(req.query.productId, {
            reviews,
            ratings,
            numOfReviews
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });


        return res.status(200).json({ success: true, reviews });

    }
);


//# Create The Product by ~~Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {

    let images = [];
 
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {

        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        });
    };

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await productsModel.create(req.body);
    if (!product) return next(new ErrorHandler("Product Not Create", 404));
    return res.status(200).json({ success: true, product });

});

//# Get All Products by ~~Admin
exports.getAdminProducts = catchAsyncError(

    async (req, res, next) => {

        const products = await productsModel.find();

        if (!products) return next(new ErrorHandler("Products Not Found", 404));

        return res.status(200).json({
            success: true,
            products,
        });
    }
);

//# Update The Product by ~~Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {

    let product = await productsModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Update", 404));

    
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {

            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        };

        req.body.images = imagesLinks;
    }

    product = await productsModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false });

    return res.status(200).json({ success: true, product });

});


//# Delete The Product by ~~Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {

    const product = await productsModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Delete", 404));

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await productsModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Product Deleted Successfully" });

});