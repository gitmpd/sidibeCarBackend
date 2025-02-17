const multer = require('multer');
const path = require('path');

// Configuration de stockage des fichiers
const { v4: uuidv4 } = require('uuid'); // Importer UUID

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4(); // Générer un identifiant unique
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpg, .jpeg, .png files are allowed'), false);
    }
};

// Créer le middleware de Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille de fichier (ici 5MB)
    fileFilter: fileFilter
});

module.exports = upload;
