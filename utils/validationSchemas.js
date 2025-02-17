const Joi = require('joi');

// Schéma de validation pour la création d'une voiture
const carCreateSchema = Joi.object({
    brand: Joi.string().required(),
    newBrand: Joi.string().optional().allow(null).empty(''),
    model: Joi.string().required(),
    newModel: Joi.string().optional().allow(null).empty(''),
    year: Joi.number().integer().min(2000).default(2000).max(new Date().getFullYear()).required(),
    price: Joi.number().min(1).required(),
    fuelType: Joi.string().valid('Essence', 'Diesel', 'Électrique', 'Hybride').default('Essence').required(),
    gearbox: Joi.string().valid('Manuelle', 'Automatique').default('Manuelle').required(),
    mileage: Joi.number().min(0).default(0).allow(null).empty(''),
    color: Joi.string().optional().allow(null).empty(''),
    available: Joi.boolean().default(true),
    vedette: Joi.boolean().default(false),
    description: Joi.string().max(500).optional().allow(null).empty(''),
    contactNumber: Joi.string().optional().allow(null).empty(''),
    whatsappLink: Joi.string().uri().optional().allow(null).empty(''),
    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
            public_id: Joi.string().required()
        })
    )
});



// Schéma de validation pour la mise à jour d'une voiture (certains champs peuvent être optionnels)
const carUpdateSchema = Joi.object({
    brand: Joi.string(),
    newBrand: Joi.string().allow(null).empty(''),
    model: Joi.string(),
    newModel: Joi.string().allow(null).empty(''),
    year: Joi.number().integer().min(1886).max(new Date().getFullYear()),
    price: Joi.number().min(1),
    fuelType: Joi.string().valid('Essence', 'Diesel', 'Électrique', 'Hybride'),
    gearbox: Joi.string().valid('Manuelle', 'Automatique'),
    mileage: Joi.number().min(0).allow(null).empty('').default(0),
    color: Joi.string().optional().allow(null).empty(''),
    available: Joi.boolean().default(true),
    vedette: Joi.boolean().default(false),
    description: Joi.string().max(500).allow(null).empty(''),
    contactNumber: Joi.string().optional().allow(null).empty(''),
    whatsappLink: Joi.string().uri().allow(null).empty(''),
    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
            public_id: Joi.string().required()
        })
    ),
    existingImages: Joi.array().items(
        Joi.object({
            _id: Joi.string().optional(),
            url: Joi.string().optional(),
            public_id: Joi.string().required()
        })
    ).optional(), // Champ optionnel
    removedImages: Joi.array().items(
        Joi.object({
            _id: Joi.string().optional(),
            url: Joi.string().uri().required(),
            public_id: Joi.string().required()
        })
    ).optional() // Champ optionnel
});
// Schéma de validation pour la création d'un admin
const adminSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    contactNumber: Joi.string().required(),
    whatsappLink: Joi.string().uri().required(),
    role: Joi.string(),
});
module.exports = { adminSchema,carCreateSchema, carUpdateSchema };
