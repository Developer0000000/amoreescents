const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({

    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        phoneNo: { type: Number, required: true },
        pinCode: { type: String, required: true },
    },

    orderItems: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
        },
    ],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    itemsPrice: { type: Number, default: 0 },

    shippingPrice: { type: Number, default: 0, required: true },

    totalPrice: { type: Number, default: 0, required: true },

    orderStatus: { type: String, default: "Processing", required: true },

    deliveredAt: Date,

    shippedAt: Date,

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
