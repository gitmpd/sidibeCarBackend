const { Car } = require("../models/CarModel");
const mongoose = require("mongoose");

// Middleware de validation
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    console.error("Validation error:", error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const createCar = async (req, res) => {
  console.log("Creating a new car...");

  // Vérifier si des fichiers ont été envoyés
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images provided" });
  }

  try {
    // Créer une liste d'images avec les informations nécessaires pour les stocker dans la base de données
    const images = req.files.map((file) => ({
      url: `/uploads/${file.filename}`, // URL publique pour accéder à l'image
      public_id: file.filename, // Nom du fichier pour la gestion future
    }));

    // Créer un nouvel enregistrement de voiture avec les images
    const car = new Car({
      ...req.body, // Inclure les autres informations de la voiture
      images: images,
    });

    await car.save(); // Sauvegarder la voiture dans la base de données
    console.log("Car created successfully:", car);
    res.status(201).json(car); // Retourner la voiture nouvellement créée
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ message: "Failed to create car" });
  }
};

const getCars = async (req, res) => {
  console.log("Fetching cars...");
  const { page = 1, limit = 10 } = req.query;

  try {
    const cars = await Car.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));
    console.log("Cars fetched successfully:", cars);
    res.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};

const updateCar = async (req, res) => {
  console.log('Updating car...');
  const carId = req.params.id;

  try {
    // Récupérer les données de la voiture depuis req.body
    const carData = { ...req.body };

    // Récupérer la voiture actuelle depuis la base de données
    const currentCar = await Car.findById(carId);
    if (!currentCar) {
      return res.status(404).json({ message: 'Voiture non trouvée.' });
    }

    // Si des fichiers sont envoyés, traiter les nouvelles images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        public_id: file.filename
      }));

      // Ajouter les nouvelles images aux images existantes
      carData.images = [...(currentCar.images || []), ...newImages];
    } else {
      // Si aucune nouvelle image n'est envoyée, utiliser uniquement les images existantes
      carData.images = currentCar.images || [];
    }

    // Supprimer les images marquées pour suppression
    if (carData.removedImages && carData.removedImages.length > 0) {
      carData.images = carData.images.filter(
        (image) =>
          !carData.removedImages.some(
            (removedImage) => removedImage?._id && image?._id && removedImage._id.toString() === image._id.toString()
          )
      );

      // Ici, vous pouvez également supprimer physiquement les fichiers des images supprimées du serveur
      carData.removedImages.forEach((image) => {
        console.log(`Suppression de l'image : ${image.public_id}`);
        // Implémentez la logique pour supprimer physiquement le fichier si nécessaire
      });
    }

    // Mettre à jour uniquement les champs spécifiés dans req.body
    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      { $set: carData }, // Utiliser $set pour ne mettre à jour que les champs spécifiés
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: 'Voiture non trouvée.' });
    }

    console.log('Car updated successfully:', updatedCar);
    res.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.', error: error.message });
  }
};
const deleteCars = async (req, res) => { 
  console.log("Deleting car...");
  console.log("Car IDs reçus :", req.body); // Affiche directement carIds

  try {
    const carIds = req.body.carIds;
    console.log("liste d'ids recus !", { carIds });

    if (!carIds || carIds.length === 0) {
      return res.status(400).json({ message: "Aucune voiture sélectionnée" });
    }
    if (!Array.isArray(carIds) || !carIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "IDs invalides" });
    }

    // Convertir les IDs en ObjectId avec "new"
    const objectIds = carIds.map(id => new mongoose.Types.ObjectId(id));

    // Supprimer les voitures avec ces IDs
    await Car.deleteMany({ _id: { $in: objectIds } });

    res.json({ message: "Suppression réussie" });
  } catch (error) {
    console.error("Erreur lors de la suppression des voitures :", error);
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};



const getCarById = async (req, res) => {
  console.log("Fetching car by ID...");
  const { id } = req.params;

  try {
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Voiture non trouvée." });
    }

    res.json(car);
  } catch (error) {
    console.error("Error fetching car by ID:", error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération.",
        error: error.message,
      });
  }
};

const searchCars = async (req, res) => {
  console.log("Searching cars...");
  const { brand, model, minPrice, maxPrice, year } = req.query;

  const filter = {};
  if (brand) filter.brand = brand;
  if (model) filter.model = model;
  if (year) filter.year = year;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  try {
    const cars = await Car.find(filter);
    res.json(cars);
  } catch (error) {
    console.error("Error searching cars:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche.", error: error.message });
  }
};

module.exports = {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCars,
  searchCars,
  validate, // Ajout pour une utilisation future
};
