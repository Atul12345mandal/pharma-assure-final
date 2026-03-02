const pool = require('../config/database');

// ==========================
// GET ALL COMPLIANCE RECORDS
// ==========================
const getComplianceRecords = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        
        const result = await pool.query(
            `SELECT c.*, 
                    u1.email as assigned_to_email,
                    u2.email as created_by_email
             FROM compliance_records c
             LEFT JOIN users u1 ON c.assigned_to = u1.id
             LEFT JOIN users u2 ON c.created_by = u2.id
             WHERE c.company_id = $1
             ORDER BY c.due_date ASC`,
            [company_id]
        );
        
        res.json({
            success: true,
            count: result.rows.length,
            records: result.rows
        });
    } catch (error) {
        console.error('❌ Get compliance error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET SINGLE COMPLIANCE RECORD
// ==========================
const getComplianceById = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        
        const result = await pool.query(
            `SELECT c.*, 
                    u1.email as assigned_to_email,
                    u2.email as created_by_email
             FROM compliance_records c
             LEFT JOIN users u1 ON c.assigned_to = u1.id
             LEFT JOIN users u2 ON c.created_by = u2.id
             WHERE c.id = $1 AND c.company_id = $2`,
            [id, company_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Compliance record not found'
            });
        }
        
        res.json({
            success: true,
            record: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Get compliance by ID error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// CREATE COMPLIANCE RECORD
// ==========================
const createComplianceRecord = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        const user_id = req.user.id;
        const {
            title,
            description,
            regulation_type,
            due_date,
            assigned_to
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO compliance_records (
                company_id, title, description, regulation_type,
                due_date, assigned_to, created_by, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [company_id, title, description, regulation_type, 
             due_date, assigned_to, user_id, 'pending']
        );
        
        res.status(201).json({
            success: true,
            message: 'Compliance record created successfully',
            record: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Create compliance error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// UPDATE COMPLIANCE RECORD
// ==========================
const updateComplianceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        const {
            title,
            description,
            regulation_type,
            status,
            due_date,
            completed_date,
            assigned_to
        } = req.body;
        
        const result = await pool.query(
            `UPDATE compliance_records 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 regulation_type = COALESCE($3, regulation_type),
                 status = COALESCE($4, status),
                 due_date = COALESCE($5, due_date),
                 completed_date = COALESCE($6, completed_date),
                 assigned_to = COALESCE($7, assigned_to),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 AND company_id = $9
             RETURNING *`,
            [title, description, regulation_type, status, 
             due_date, completed_date, assigned_to, id, company_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Compliance record not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Compliance record updated successfully',
            record: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Update compliance error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// DELETE COMPLIANCE RECORD
// ==========================
const deleteComplianceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        
        const result = await pool.query(
            'DELETE FROM compliance_records WHERE id = $1 AND company_id = $2 RETURNING id',
            [id, company_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Compliance record not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Compliance record deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete compliance error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = {
    getComplianceRecords,
    getComplianceById,
    createComplianceRecord,
    updateComplianceRecord,
    deleteComplianceRecord
};