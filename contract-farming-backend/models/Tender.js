const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
    cropName: { type: String, required: true },
    requiredQuantity: { type: String, required: true }, // Using String for flexibility (e.g., "500 Quintals", "10 Acres")
    contractDuration: { type: String, required: true },
    unitPrice: { type: String, required: true },
    
    status: { 
        type: String, 
        enum: ['open', 'accepted', 'completed'], 
        default: 'open' 
    },
    
    // Link to the Company (User) who posted the tender
    companyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Link to the Farmer (User) who accepted the tender
    farmerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('Tender', TenderSchema);