var express = require('express');
var router = express.Router();

const { contact, getAllContacts, getSingleContact, deleteContact } = require('../controllers/contactsController');
const { isAuthenticatedUser, authorizedRole } = require('../middlewares/authMiddleware');


router.route('/contact').post(contact);

router.route('/admin/contacts').get(isAuthenticatedUser, authorizedRole('admin'), getAllContacts);
router.route('/admin/contact/:id')
    .get(isAuthenticatedUser, authorizedRole('admin'), getSingleContact)
    .delete(isAuthenticatedUser, authorizedRole('admin'), deleteContact);


module.exports = router;