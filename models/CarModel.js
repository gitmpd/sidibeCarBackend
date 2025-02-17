const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true, min: 1886, max: new Date().getFullYear() },
    price: { type: Number, required: true, min: 1 },
    fuelType: { type: String, enum: ['Essence', 'Diesel', 'Électrique', 'Hybride'], required: true },
    gearbox: { type: String, enum: ['Manuelle', 'Automatique'], required: true },
    mileage: { type: Number },
    available: { type: Boolean, default: true },
    vedette: { type: Boolean, default: false },
    description: { type: String, maxlength: 500 },
    color: { type: String },
    contactNumber: { type: String },
    whatsappLink: { type: String },
    images: [
        {
            url: { type: String, required: true },
            public_id: { type: String, required: true },
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true } // _id est généré automatiquement
        }
    ]
}, 
{
    timestamps: true
});

const Car = mongoose.model('Car', carSchema);
module.exports = { Car };
