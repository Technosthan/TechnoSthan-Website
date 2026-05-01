const router = require('express').Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadContacts, getMyStatus, deleteMyContacts } = require('../controllers/userController');

router.post('/upload', protect, upload.single('file'), uploadContacts);
router.get('/status', protect, getMyStatus);
router.delete('/my-contacts', protect, deleteMyContacts);

module.exports = router;
