const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// All admin routes must pass the adminAuth middleware
router.use(adminMiddleware);

// Analytics
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

// Vault Management
router.get('/vault', adminController.getAllVaultItems);
router.put('/vault/:id/approve', adminController.approveVaultItem);
router.delete('/vault/:id', adminController.deleteVaultItem);

// Content Management
router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.addQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.sendNotification);

module.exports = router;
