const express = require('express');
const router = express.Router();
console.log('✅ complianceRoutes.js LOADED!'); // DEBUG LINE 1

const { authenticate } = require('../middleware/auth');
console.log('✅ Auth middleware imported'); // DEBUG LINE 2

const { authorize } = require('../middleware/role');
console.log('✅ Role middleware imported'); // DEBUG LINE 3

const {
    getComplianceRecords,
    getComplianceById,
    createComplianceRecord,
    updateComplianceRecord,
    deleteComplianceRecord
} = require('../controllers/complianceController');
console.log('✅ Compliance controller imported'); // DEBUG LINE 4

// All routes require authentication
router.use(authenticate);
console.log('✅ Authentication middleware applied'); // DEBUG LINE 5

// Compliance routes
console.log('📋 Registering compliance routes:'); // DEBUG LINE 6
console.log('   - GET /'); // DEBUG LINE 7
console.log('   - GET /:id'); // DEBUG LINE 8
console.log('   - POST /'); // DEBUG LINE 9
console.log('   - PUT /:id'); // DEBUG LINE 10
console.log('   - DELETE /:id'); // DEBUG LINE 11

router.get('/', (req, res, next) => {
    console.log('🔥 GET /api/compliance ROUTE HIT!'); // DEBUG LINE 12
    getComplianceRecords(req, res, next);
});

router.get('/:id', (req, res, next) => {
    console.log(`🔥 GET /api/compliance/${req.params.id} ROUTE HIT!`); // DEBUG LINE 13
    getComplianceById(req, res, next);
});

router.post('/', authorize('admin', 'manager'), (req, res, next) => {
    console.log('🔥 POST /api/compliance ROUTE HIT!'); // DEBUG LINE 14
    console.log('📦 Request body:', req.body); // DEBUG LINE 15
    createComplianceRecord(req, res, next);
});

router.put('/:id', authorize('admin', 'manager'), (req, res, next) => {
    console.log(`🔥 PUT /api/compliance/${req.params.id} ROUTE HIT!`); // DEBUG LINE 16
    updateComplianceRecord(req, res, next);
});

router.delete('/:id', authorize('admin'), (req, res, next) => {
    console.log(`🔥 DELETE /api/compliance/${req.params.id} ROUTE HIT!`); // DEBUG LINE 17
    deleteComplianceRecord(req, res, next);
});

console.log('✅ All compliance routes registered successfully!'); // DEBUG LINE 18

module.exports = router;