const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all zillas
router.get('/zillas', async (req, res) => {
    try {
        const [zillas] = await db.query('SELECT * FROM zillas ORDER BY name');
        res.json({ zillas });
    } catch (error) {
        console.error('Get zillas error:', error);
        res.status(500).json({ error: 'Failed to fetch zillas' });
    }
});

// Get thanas for a specific zilla
router.get('/thanas/:zillaId', async (req, res) => {
    try {
        const [thanas] = await db.query(
            'SELECT * FROM thanas WHERE zilla_id = ? ORDER BY name',
            [req.params.zillaId]
        );
        res.json({ thanas });
    } catch (error) {
        console.error('Get thanas error:', error);
        res.status(500).json({ error: 'Failed to fetch thanas' });
    }
});

module.exports = router;
