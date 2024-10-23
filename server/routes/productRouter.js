var express = require('express');
const { isAuthenticatedUser, authorizedRole } = require('../middlewares/authMiddleware');

const {
    getProductsDetails, getAllProducts,
    createProduct, getAdminProducts, updateProduct, deleteProduct,
    createProductReview, getProductReviews, deleteReview
} = require('../controllers/productsController');

var router = express.Router();


router.route('/products').get(getAllProducts);

router.route('/product/:id').get(getProductsDetails);


router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews')
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview)


router.route('/admin/product/new').post(isAuthenticatedUser, authorizedRole('admin'), createProduct);

router.route('/admin/products').get(isAuthenticatedUser, authorizedRole('admin'), getAdminProducts);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizedRole('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizedRole('admin'), deleteProduct);

module.exports = router;