const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllUploads, approveUploads, rejectUploads, getEmailConfig, updateEmailConfig, getSystemSettings, updateSystemSettings, getActivity, getNotifications } = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/uploads', getAllUploads);
router.post('/approve/:uploadedBy', approveUploads);
router.post('/reject/:uploadedBy', rejectUploads);
router.get('/email-config', getEmailConfig);
router.put('/email-config', updateEmailConfig);
router.get('/system-settings', getSystemSettings);
router.put('/system-settings', updateSystemSettings);
router.get('/activity', getActivity);
router.get('/notifications', getNotifications);
module.exports = router;
