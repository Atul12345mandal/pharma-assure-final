const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats,
    getMonthlyHires,        
    getSalaryDistribution,  
    getDepartmentStats      
} = require('../controllers/employeeController');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.get('/', getEmployees);
router.get('/stats', getEmployeeStats);
router.get('/stats/monthly-hires', getMonthlyHires);           // NEW
router.get('/stats/salary-distribution', getSalaryDistribution); // NEW
router.get('/stats/departments', getDepartmentStats);          // NEW
router.get('/:id', getEmployeeById);
router.post('/', authorize('admin', 'manager'), createEmployee);
router.put('/:id', authorize('admin', 'manager'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;