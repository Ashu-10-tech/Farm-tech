const express = require('express');
const router = express.Router();
const Tender = require('../models/Tender');
const auth = require('../middleware/auth'); // Import authorization middleware

// @route   POST /api/tenders
// @desc    Company posts a new tender
// @access  Private (Company only)
router.post('/', auth(['company']), async (req, res) => {
    const { cropName, requiredQuantity, contractDuration, unitPrice } = req.body;

    try {
        const newTender = new Tender({
            cropName,
            requiredQuantity,
            contractDuration,
            unitPrice,
            companyId: req.user.id // Get company ID from the authenticated user
        });

        const tender = await newTender.save();
        res.json(tender);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error posting tender.');
    }
});

// @route   GET /api/tenders/open
// @desc    Farmer views all open tenders
// @access  Private (Farmer only)
router.get('/open', auth(['farmer']), async (req, res) => {
    try {
        const openTenders = await Tender.find({ status: 'open' })
                                         .populate('companyId', 'username profile.companyName'); // Populate company details
        res.json(openTenders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching open tenders.');
    }
});

// @route   PUT /api/tenders/accept/:id
// @desc    Farmer accepts an open tender
// @access  Private (Farmer only)
router.put('/accept/:id', auth(['farmer']), async (req, res) => {
    try {
        let tender = await Tender.findById(req.params.id);

        if (!tender) {
            return res.status(404).json({ msg: 'Tender not found.' });
        }
        
        if (tender.status !== 'open') {
            return res.status(400).json({ msg: 'Tender is already accepted or completed.' });
        }

        // Update tender status and assign farmerId
        tender.farmerId = req.user.id; // Get farmer ID from the authenticated user
        tender.status = 'accepted';

        await tender.save();
        res.json(tender);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Tender not found.' });
        }
        res.status(500).send('Server error accepting tender.');
    }
});

// @route   GET /api/tenders/mycontracts
// @desc    Get all contracts for the logged-in user (farmer or company)
// @access  Private (All authenticated users)
router.get('/mycontracts', auth(['farmer', 'company']), async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        let query = {};

        if (role === 'company') {
            query = { companyId: userId };
        } else if (role === 'farmer') {
            query = { farmerId: userId, status: { $in: ['accepted', 'completed'] } };
        } else {
            return res.status(403).json({ msg: 'Invalid user role.' });
        }
        
        const contracts = await Tender.find(query)
                                        .populate('companyId', 'username profile.companyName')
                                        .populate('farmerId', 'username profile.farmAcres');

        res.json(contracts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching contracts.');
    }
});

// @route   PUT /api/tenders/complete/:id
// @desc    Company marks an accepted tender as completed
// @access  Private (Company only)
router.put('/complete/:id', auth(['company']), async (req, res) => {
    try {
        let tender = await Tender.findById(req.params.id);

        if (!tender) {
            return res.status(404).json({ msg: 'Tender not found.' });
        }
        
        if (tender.status !== 'accepted') {
            return res.status(400).json({ msg: 'Tender must be accepted before being completed.' });
        }
        
        // Ensure the company trying to complete the contract is the one who posted it
        if (tender.companyId.toString() !== req.user.id) {
             return res.status(403).json({ msg: 'Authorization denied. You did not post this contract.' });
        }

        tender.status = 'completed';

        await tender.save();
        res.json(tender);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error completing tender.');
    }
});

module.exports = router;