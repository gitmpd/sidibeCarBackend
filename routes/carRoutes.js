
const express = require('express');
const {
    createCar,
    getCars,
    getCarById,
    updateCar,
    deleteCars,
    searchCars,
    validate
} = require('../controllers/carController');
const upload = require('../config/multerConfig'); // Importer la configuration Multer
const { carCreateSchema, carUpdateSchema } = require('../utils/validationSchemas');

const router = express.Router();

// Ici, nous utilisons multer pour gérer le téléchargement d'images
router.post('/',upload.array('images', 5), validate(carCreateSchema),  createCar);
router.put('/:id',upload.array('images', 5), validate(carUpdateSchema), updateCar);

// Routes publiques
router.get('/', getCars); // Liste des voitures
router.get('/search', searchCars); // Recherche des voitures avec pagination
router.get('/:id', getCarById); // Détails d'une voiture
router.post('/delete-multiple', deleteCars);

module.exports = router;
