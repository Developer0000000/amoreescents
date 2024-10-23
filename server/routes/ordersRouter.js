//  user router 

var express = require('express');
var router = express.Router();

const { isAuthenticatedUser, authorizedRole } = require('../middlewares/authMiddleware');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder, deleteUserOrder } = require('../controllers/ordersController');


router.route('/order/new').post(isAuthenticatedUser, newOrder);

router.route('/orders/me').get(isAuthenticatedUser, myOrders);
router.route('/order/:id')
    .get(isAuthenticatedUser, getSingleOrder)
    .delete(isAuthenticatedUser, deleteUserOrder);


router.route('/admin/orders').get(isAuthenticatedUser, authorizedRole('admin'), getAllOrders);
router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizedRole('admin'), updateOrder)
    .delete(isAuthenticatedUser, authorizedRole('admin'), deleteOrder)



module.exports = router;