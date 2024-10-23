var express = require('express');
var router = express.Router();

const {
    registerUser, loginUser, logoutUser, forgetPassword, resetPassword,
    getUserDetails, updatePassword, updateProfile,
    getAllUsers, getSingleUser, updateUserRole, deleteUser
} = require('../controllers/usersController');
const { isAuthenticatedUser, authorizedRole } = require('../middlewares/authMiddleware');


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);

router.route('/password/forget').post(forgetPassword)
router.route('/reset/password').put(resetPassword);

router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);


router.route('/admin/users').get(isAuthenticatedUser, authorizedRole('admin'), getAllUsers);
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizedRole('admin'), getSingleUser)
    .put(isAuthenticatedUser, authorizedRole('admin'), updateUserRole)
    .delete(isAuthenticatedUser, authorizedRole('admin'), deleteUser);



module.exports = router;
