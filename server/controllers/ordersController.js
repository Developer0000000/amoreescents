const productsModel = require("../models/productsModel");
const ErrorHandler = require("../utils/error/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const orderModel = require("../models/ordersModel");
const updateStock = require("../utils/functions/updateStock");

const sendOrderConfirmationEmail = require("../utils/mails/sendOrderConfirmationEmail");
const sendDeliveryConfirmationEmail = require("../utils/mails/sendDeliveryConfirmationEmail");
const sendShippingConfirmationEmail = require("../utils/mails/sendShippingConfirmationEmail");



// * Create New Order
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const { shippingInfo, orderItems, itemsPrice, shippingPrice, totalPrice } = req.body;
    const user = req.user;

    // Check stock for each item before creating the order
    try {
        for (const item of orderItems) {
            await updateStock(item.product, item.qty);
        }
    } catch (error) {
        return next(error);  // If stock is insufficient, return the error before creating the order
    }

    // Create the order only if stock is sufficient
    const order = await orderModel.create({
        shippingInfo, orderItems, itemsPrice, shippingPrice, totalPrice, user: user._id,
    });

    if (!order) return next(new ErrorHandler("Order Not Created", 404));

    // Send order confirmation email
    try {
        const email = user.email;
        const name = user.name;
        const orderId = order._id;
        const totalAmount = totalPrice;

        await sendOrderConfirmationEmail({ email, name, orderId, orderItems, totalAmount });

        res.status(200).json({
            success: true,
            message: `Order placed successfully and email sent to ${email}.`,
            order
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});



// * Get LoggedIn user Order
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await orderModel.find({ user: req.user._id });
    if (!orders) return next(new ErrorHandler("Orders Not Found", 404));
    res.status(200).json({ success: true, orders });
});

//* Get Single Order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id).populate("user", "name email");
    if (!order) return next(new ErrorHandler("Order not found with this Id", 404));
    res.status(200).json({ success: true, order });
});

//* delete User Order
exports.deleteUserOrder = catchAsyncError(async (req, res, next) => {

    const order = await orderModel.findById(req.params.id);
    if (!order || order.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Order not found or not authorized", 404));
    }

    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Cannot delete order after it has been shipped", 400));
    }

    order.orderItems.forEach(async item => {
        const product = await productsModel.findById(item.product);
        product.stock = product.stock + item.qty;
        await product.save({ validateBeforeSave: false });
    });

    await order.deleteOne();

    res.status(200).json({ success: true, message: "Order has been deleted" });
});



//# Get All Order ~~ Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {

    const orders = await orderModel.find();
    if (!orders) return next(new ErrorHandler("Orders Not Found", 404));

    let totalPrice = 0;

    orders.forEach(order => {
        totalPrice += order.totalPrice;
    });

    res.status(200).json({ success: true, orders, totalPrice });

});

//# Update Order Status ~~ Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id).populate('user');;

    if (!order) return next(new ErrorHandler("Order not found with this Id", 404));

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 400));
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Shipped") order.shippedAt = Date.now();
    else if (req.body.status === "Delivered") order.deliveredAt = Date.now();

    await order.save({ validateBeforeSave: false });

    // Check if user information is populated
    if (!order.user || !order.user?.email || !order.user?.name) {
        return next(new ErrorHandler("User details are missing.", 500));
    }

    if (req.body.status === "Shipped") {
        try {
            await sendShippingConfirmationEmail({
                email: order.user?.email,
                name: order.user?.name,
                orderId: order._id,
                orderItems: order.orderItems,
                totalAmount: order.totalPrice
            });

            res.status(200).json({
                success: true,
                message: `Order status updated to '${req.body.status}' and shipping confirmation email sent successfully!`,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
    else if (req.body.status === "Delivered") {
        try {
            await sendDeliveryConfirmationEmail({
                email: order.user?.email,
                name: order.user?.name,
                orderId: order._id,
                orderItems: order.orderItems,
                totalAmount: order.totalPrice
            });

            res.status(200).json({
                success: true,
                message: `Order status updated to '${req.body.status}' and delivery confirmation email sent successfully!`,
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
    else {
        res.status(200).json({
            success: true,
            message: `Order status updated to '${req.body.status}'`,
            order
        });
    }
});

//# Delete Orders ~~ Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {

    const order = await orderModel.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order not found with this Id", 404));

    if (order.orderStatus === "Shipped") {
        return next(new ErrorHandler("You can't have permission to delete this order until it has been Delivered", 400));
    }

    if (order.orderStatus !== "Delivered") {
        order.orderItems.forEach(async item => {
            const product = await productsModel.findById(item.product);
            product.stock = product.stock + item.qty;
            await product.save({ validateBeforeSave: false });
        });
    }

    await order.deleteOne();

    res.status(200).json({ success: true });
});

