console.log('🔥🔥🔥 REGULATION ROUTES FILE IS BEING EXECUTED! 🔥🔥🔥');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
    uploadRegulation,
    getRegulations,
    getRegulationById,
    getRegulationsByDomain,
    deleteRegulation
} = require('../controllers/regulationController');

// ===== PUBLIC ROUTES (NO AUTH NEEDED) =====
router.get('/test', (req, res) => {
    console.log('🔥 PUBLIC TEST ROUTE HIT!');
    res.json({ 
        success: true, 
        message: 'Regulation routes are working! PUBLIC ACCESS',
        time: new Date().toISOString()
    });
});

// ===== AUTHENTICATION REQUIRED FOR ALL ROUTES BELOW =====
router.use(authenticate);

// Test route with auth
router.get('/test-auth', (req, res) => {
    console.log('🔥 AUTH TEST ROUTE HIT!');
    res.json({ 
        success: true, 
        message: 'Regulation auth route working!',
        user: req.user 
    });
});

// Regulation routes
router.post('/upload', authorize('admin', 'manager'), uploadRegulation);
router.get('/', getRegulations);
router.get('/domain/:domain', getRegulationsByDomain);
router.get('/:id', getRegulationById);
router.delete('/:id', authorize('admin'), deleteRegulation);

module.exports = router;