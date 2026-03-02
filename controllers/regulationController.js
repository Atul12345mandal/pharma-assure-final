const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/regulations';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'regulation-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only accept PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: fileFilter
}).single('regulation');

// ==========================
// UPLOAD REGULATION PDF
// ==========================
const uploadRegulation = async (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            console.error('❌ Upload error:', err.message);
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No PDF file uploaded' 
            });
        }

        try {
            const company_id = req.user.company_id;
            const user_id = req.user.id;
            const { 
                title, 
                regulation_type, 
                domain, 
                version, 
                effective_date 
            } = req.body;

            // For now, store placeholder for AI extraction
            // Later we'll integrate OpenAI to extract actual clauses
            const placeholderClauses = JSON.stringify([
                {
                    clause_number: "1.0",
                    content: "AI extraction pending - This will be replaced with actual extracted text",
                    page: 1
                }
            ]);

            const result = await pool.query(
                `INSERT INTO regulations (
                    company_id, title, regulation_type, domain, version,
                    file_path, file_name, file_size, effective_date,
                    clauses, uploaded_by, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id, title, regulation_type, domain, version, upload_date`,
                [
                    company_id, 
                    title || req.file.originalname.replace('.pdf', ''), 
                    regulation_type || 'FDA', 
                    domain || 'GMP', 
                    version || '1.0',
                    req.file.path, 
                    req.file.originalname, 
                    req.file.size,
                    effective_date || new Date(),
                    placeholderClauses,
                    user_id,
                    'active'
                ]
            );

            console.log('✅ Regulation uploaded successfully. ID:', result.rows[0].id);

            res.status(201).json({
                success: true,
                message: 'Regulation uploaded successfully',
                regulation: result.rows[0]
            });

        } catch (error) {
            console.error('❌ Database error:', error.message);
            // Delete uploaded file if database insert fails
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            res.status(500).json({ 
                success: false, 
                message: 'Server error',
                error: error.message 
            });
        }
    });
};

// ==========================
// GET ALL REGULATIONS
// ==========================
const getRegulations = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        
        const result = await pool.query(
            `SELECT id, title, regulation_type, domain, version, 
                    file_name, file_size, upload_date, effective_date, status
             FROM regulations
             WHERE company_id = $1 AND status = 'active'
             ORDER BY upload_date DESC`,
            [company_id]
        );
        
        console.log(`✅ Found ${result.rows.length} regulations`);

        res.json({
            success: true,
            count: result.rows.length,
            regulations: result.rows
        });
    } catch (error) {
        console.error('❌ Get regulations error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET REGULATION BY ID
// ==========================
const getRegulationById = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        
        const result = await pool.query(
            `SELECT id, title, regulation_type, domain, version, 
                    file_name, file_size, upload_date, effective_date, status,
                    clauses
             FROM regulations
             WHERE id = $1 AND company_id = $2 AND status = 'active'`,
            [id, company_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Regulation not found'
            });
        }
        
        res.json({
            success: true,
            regulation: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Get regulation error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET REGULATIONS BY DOMAIN
// ==========================
const getRegulationsByDomain = async (req, res) => {
    try {
        const { domain } = req.params;
        const company_id = req.user.company_id;
        
        const result = await pool.query(
            `SELECT id, title, regulation_type, version, upload_date
             FROM regulations 
             WHERE company_id = $1 AND domain = $2 AND status = 'active'
             ORDER BY upload_date DESC`,
            [company_id, domain]
        );
        
        res.json({
            success: true,
            count: result.rows.length,
            regulations: result.rows
        });
    } catch (error) {
        console.error('❌ Get by domain error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// DELETE REGULATION (SOFT DELETE)
// ==========================
const deleteRegulation = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        
        // Soft delete - just mark as inactive
        const result = await pool.query(
            `UPDATE regulations 
             SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND company_id = $2 AND status = 'active'
             RETURNING id`,
            [id, company_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Regulation not found or already deleted'
            });
        }
        
        console.log('✅ Regulation deleted. ID:', id);

        res.json({
            success: true,
            message: 'Regulation deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete regulation error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = {
    uploadRegulation,
    getRegulations,
    getRegulationById,
    getRegulationsByDomain,
    deleteRegulation
};