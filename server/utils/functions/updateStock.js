const productsModel = require("../../models/productsModel");
const ErrorHandler = require("../error/errorHandler");

const updateStock = async (id, qty) => {
    const product = await productsModel.findById(id);
    if (product.stock === 0) throw new ErrorHandler(`Product ${product.name} is out of stock.`, 400);
    product.stock -= qty;
    await product.save({ validateBeforeSave: false });
};

module.exports = updateStock;


